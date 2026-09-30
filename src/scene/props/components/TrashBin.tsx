import { useEffect, useMemo, useRef } from 'react';
import { useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { CylinderCollider, RigidBody, type RapierRigidBody } from '@react-three/rapier';
import { registerInteractable, requestInteraction } from '@/scene/interaction/interactables';
import { player } from '@/scene/player/playerState';
import { useGameStore } from '@/scene/store/gameStore';
import { useToastStore } from '@/scene/store/toastStore';
import { PROP_TEXTURES } from '@/scene/textures/assets';
import { TRASH_BINS } from '@/scene/world/cityLayout';
import { onTap } from '@/scene/world/events';
import { getForward } from '../carry';
import { usePropsStore } from '../propsStore';
import { PLAYER_BODY_NAME } from './PlayerBody';

type BinPlacement = (typeof TRASH_BINS)[number];

const BIN_RADIUS = 0.42;
const BIN_HALF_HEIGHT = 0.5;
const LID_HALF_HEIGHT = 0.04;
/** Running into a bin faster than this kicks it automatically. */
const AUTO_KICK_SPEED = 6.5;
/** A bin respawns this long after a kick, once the player has walked away. */
const RESET_AFTER_MS = 12_000;
const RESET_MIN_DISTANCE = 5;

// Painted-steel street bin (see trash-bin.svg); slight emission keeps it readable at night.
const STEEL = { color: '#9aa2ab', metalness: 0.4, roughness: 0.45 } as const;
const LID_GREEN = '#2a5c37';

function BinModel() {
  const skin = useTexture(PROP_TEXTURES.trashBin);
  return (
    <group>
      <mesh>
        <cylinderGeometry args={[BIN_RADIUS, BIN_RADIUS * 0.9, BIN_HALF_HEIGHT * 2, 28, 1, true]} />
        <meshStandardMaterial
          map={skin}
          emissiveMap={skin}
          emissive="#ffffff"
          emissiveIntensity={0.2}
          roughness={0.6}
          metalness={0.2}
        />
      </mesh>
      <mesh position-y={-BIN_HALF_HEIGHT + 0.01}>
        <cylinderGeometry args={[BIN_RADIUS * 0.9, BIN_RADIUS * 0.9, 0.02, 28]} />
        <meshStandardMaterial {...STEEL} />
      </mesh>
      {/* Rolled steel rim at the top. */}
      <mesh position-y={BIN_HALF_HEIGHT} rotation-x={Math.PI / 2}>
        <torusGeometry args={[BIN_RADIUS, 0.02, 8, 28]} />
        <meshStandardMaterial {...STEEL} emissive="#3a4048" emissiveIntensity={0.4} />
      </mesh>
    </group>
  );
}

function LidModel() {
  return (
    <group>
      <mesh>
        <cylinderGeometry args={[BIN_RADIUS * 0.85, BIN_RADIUS + 0.03, LID_HALF_HEIGHT * 2, 28]} />
        <meshStandardMaterial color={LID_GREEN} emissive={LID_GREEN} emissiveIntensity={0.25} roughness={0.55} />
      </mesh>
      <mesh position-y={0.07}>
        <torusGeometry args={[0.1, 0.02, 8, 16, Math.PI]} />
        <meshStandardMaterial {...STEEL} />
      </mesh>
    </group>
  );
}

/** Kickable street bin: tips over, loses its lid and spills a couple of cans. */
function TrashBin({ bin: placement }: { bin: BinPlacement }) {
  const interactableId = placement.id;
  const generation = usePropsStore((state) => state.bins[placement.id].generation);
  const bin = useRef<RapierRigidBody>(null);
  const lid = useRef<RapierRigidBody>(null);
  const lastKick = useRef(0);
  const spot = useMemo<{ x: number; z: number }>(() => ({ x: placement.x, z: placement.z }), [placement]);

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
    markBinKicked(placement.id);
    useToastStore.getState().unlock('vandal');
  };

  const kickRef = useRef(kick);
  kickRef.current = kick;

  useEffect(
    () =>
      registerInteractable({
        id: interactableId,
        label: 'Kick the bin',
        spot,
        radius: 1.6,
        activate: () => kickRef.current(),
        isEnabled: () => usePropsStore.getState().minigame === null,
      }),
    [interactableId, spot],
  );

  useFrame(() => {
    if (bin.current) {
      const { x, z } = bin.current.translation();
      spot.x = x;
      spot.z = z;
    }
    const { bins, resetBin } = usePropsStore.getState();
    const { kickedAt } = bins[placement.id];
    if (
      kickedAt !== null &&
      Date.now() - kickedAt > RESET_AFTER_MS &&
      Math.hypot(player.position.x - placement.x, player.position.z - placement.z) > RESET_MIN_DISTANCE
    ) {
      resetBin(placement.id);
    }
  });

  return (
    <group key={generation}>
      <RigidBody
        ref={bin}
        colliders={false}
        position={[placement.x, BIN_HALF_HEIGHT, placement.z]}
        onCollisionEnter={({ other }) => {
          if (other.rigidBodyObject?.name === PLAYER_BODY_NAME && player.speed > AUTO_KICK_SPEED) kickRef.current();
        }}
      >
        <CylinderCollider args={[BIN_HALF_HEIGHT, BIN_RADIUS]} density={6} friction={0.8} />
        <group onClick={onTap(() => requestInteraction(interactableId, useGameStore.getState().nearbyId))}>
          <BinModel />
        </group>
      </RigidBody>
      <RigidBody
        ref={lid}
        colliders={false}
        position={[placement.x, BIN_HALF_HEIGHT * 2 + LID_HALF_HEIGHT + 0.01, placement.z]}
      >
        <CylinderCollider args={[LID_HALF_HEIGHT, BIN_RADIUS + 0.03]} density={3} restitution={0.3} />
        <LidModel />
      </RigidBody>
    </group>
  );
}

/** Every trash bin in the district. */
export function TrashBins() {
  return (
    <>
      {TRASH_BINS.map((bin) => (
        <TrashBin key={bin.id} bin={bin} />
      ))}
    </>
  );
}
