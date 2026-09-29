import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { CylinderCollider, RigidBody, type RapierRigidBody } from '@react-three/rapier';
import { registerInteractable, requestInteraction } from '@/scene/interaction/interactables';
import { neon } from '@/scene/materials/neon';
import { player } from '@/scene/player/playerState';
import { useGameStore } from '@/scene/store/gameStore';
import { useToastStore } from '@/scene/store/toastStore';
import { TRASH_BIN } from '@/scene/world/cityLayout';
import { onTap } from '@/scene/world/events';
import { getForward } from '../carry';
import { usePropsStore } from '../propsStore';
import { PLAYER_BODY_NAME } from './PlayerBody';

const BIN_RADIUS = 0.42;
const BIN_HALF_HEIGHT = 0.5;
const LID_HALF_HEIGHT = 0.04;
const BIN_ID = 'trash-bin';
/** Running into the bin faster than this kicks it automatically. */
const AUTO_KICK_SPEED = 6.5;
/** The bin respawns this long after a kick, once the player has walked away. */
const RESET_AFTER_MS = 12_000;
const RESET_MIN_DISTANCE = 5;

function BinModel() {
  const glow = neon('#1cff9e', 1.8);
  return (
    <group>
      <mesh>
        <cylinderGeometry args={[BIN_RADIUS, BIN_RADIUS * 0.9, BIN_HALF_HEIGHT * 2, 20]} />
        <meshStandardMaterial color="#2a3340" metalness={0.8} roughness={0.45} />
      </mesh>
      {[0.3, -0.3].map((y) => (
        <mesh key={y} position-y={y}>
          <cylinderGeometry args={[BIN_RADIUS + 0.01, BIN_RADIUS + 0.01, 0.04, 20, 1, true]} />
          <meshBasicMaterial color={glow} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

function LidModel() {
  return (
    <group>
      <mesh>
        <cylinderGeometry args={[BIN_RADIUS + 0.03, BIN_RADIUS + 0.03, LID_HALF_HEIGHT * 2, 20]} />
        <meshStandardMaterial color="#3a4452" metalness={0.8} roughness={0.4} />
      </mesh>
      <mesh position-y={0.08}>
        <torusGeometry args={[0.1, 0.02, 8, 16, Math.PI]} />
        <meshStandardMaterial color="#8a93a6" metalness={0.9} roughness={0.3} />
      </mesh>
    </group>
  );
}

/** Kickable street bin: tips over, loses its lid and spills a couple of cans. */
export function TrashBin() {
  const generation = usePropsStore((state) => state.binGeneration);
  const bin = useRef<RapierRigidBody>(null);
  const lid = useRef<RapierRigidBody>(null);
  const lastKick = useRef(0);
  const spot = useMemo<{ x: number; z: number }>(() => ({ x: TRASH_BIN.x, z: TRASH_BIN.z }), []);

  const kick = () => {
    const now = performance.now();
    if (!bin.current || now - lastKick.current < 1000) return;
    lastKick.current = now;

    const forward = getForward();
    bin.current.applyImpulse({ x: forward.x * 14, y: 5, z: forward.z * 14 }, true);
    bin.current.applyTorqueImpulse({ x: forward.z * 3, y: 0.5, z: -forward.x * 3 }, true);
    lid.current?.applyImpulse({ x: forward.x * 0.8, y: 1.6, z: forward.z * 0.8 }, true);

    // Spill a couple of cans out of the top.
    const { x, z } = bin.current.translation();
    const { spawnCan, markBinKicked } = usePropsStore.getState();
    for (let i = 0; i < 2; i++) {
      const spread = (i - 0.5) * 2;
      spawnCan([x, 1.3, z], [forward.x * 3 + spread, 3, forward.z * 3 - spread]);
    }
    markBinKicked();
    useToastStore.getState().unlock('vandal');
  };

  const kickRef = useRef(kick);
  kickRef.current = kick;

  useEffect(
    () =>
      registerInteractable({
        id: BIN_ID,
        label: 'Kick the bin',
        spot,
        radius: 1.6,
        activate: () => kickRef.current(),
        isEnabled: () => usePropsStore.getState().minigame === null,
      }),
    [spot],
  );

  useFrame(() => {
    if (bin.current) {
      const { x, z } = bin.current.translation();
      spot.x = x;
      spot.z = z;
    }
    const { binKickedAt, resetBin } = usePropsStore.getState();
    if (
      binKickedAt !== null &&
      Date.now() - binKickedAt > RESET_AFTER_MS &&
      Math.hypot(player.position.x - TRASH_BIN.x, player.position.z - TRASH_BIN.z) > RESET_MIN_DISTANCE
    ) {
      resetBin();
    }
  });

  return (
    <group key={generation}>
      <RigidBody
        ref={bin}
        colliders={false}
        position={[TRASH_BIN.x, BIN_HALF_HEIGHT, TRASH_BIN.z]}
        onCollisionEnter={({ other }) => {
          if (other.rigidBodyObject?.name === PLAYER_BODY_NAME && player.speed > AUTO_KICK_SPEED) kickRef.current();
        }}
      >
        <CylinderCollider args={[BIN_HALF_HEIGHT, BIN_RADIUS]} density={6} friction={0.8} />
        <group onClick={onTap(() => requestInteraction(BIN_ID, useGameStore.getState().nearbyId))}>
          <BinModel />
        </group>
      </RigidBody>
      <RigidBody
        ref={lid}
        colliders={false}
        position={[TRASH_BIN.x, BIN_HALF_HEIGHT * 2 + LID_HALF_HEIGHT + 0.01, TRASH_BIN.z]}
      >
        <CylinderCollider args={[LID_HALF_HEIGHT, BIN_RADIUS + 0.03]} density={3} restitution={0.3} />
        <LidModel />
      </RigidBody>
    </group>
  );
}
