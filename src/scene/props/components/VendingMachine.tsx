import { useRef } from 'react';
import { useTexture } from '@react-three/drei';
import { CuboidCollider, RigidBody } from '@react-three/rapier';
import { requestInteraction } from '@/scene/interaction/interactables';
import { useInteractable } from '@/scene/interaction/useInteractable';
import { neon } from '@/scene/materials/neon';
import { useGameStore } from '@/scene/store/gameStore';
import { useToastStore } from '@/scene/store/toastStore';
import { PROP_TEXTURES } from '@/scene/textures/assets';
import { onTap } from '@/scene/world/events';
import { VENDING } from '../propLayout';
import { usePropsStore } from '../propsStore';

const VENDING_ID = 'vending';
const WIDTH = 1.3;
const HEIGHT = 2.2;
const DEPTH = 0.9;
const BOOST_MS = 10_000;
const COOLDOWN_MS = 3_000;

/** Energy drink machine: a speed boost for the android plus an empty can to play with. */
export function VendingMachine() {
  const front = useTexture(PROP_TEXTURES.vendingFront);
  const lastSale = useRef(-Infinity);

  const buy = () => {
    const now = performance.now();
    if (now - lastSale.current < COOLDOWN_MS) return;
    lastSale.current = now;

    const { startBoost, spawnCan } = usePropsStore.getState();
    startBoost(BOOST_MS);
    // The empty can pops out of the tray.
    spawnCan([VENDING.tray.x, VENDING.tray.y, VENDING.tray.z], [VENDING.facing.x * 2.2, 1.5, VENDING.facing.z * 2.2]);
    const toasts = useToastStore.getState();
    toasts.push('Energy boost! Run faster for 10 s');
    toasts.unlock('sugar-rush');
  };

  useInteractable({
    id: VENDING_ID,
    label: 'Buy an energy drink',
    spot: VENDING.spot,
    radius: 1.4,
    activate: buy,
    isEnabled: () => usePropsStore.getState().minigame === null,
  });

  return (
    <RigidBody type="fixed" colliders={false} position={[VENDING.x, 0, VENDING.z]} rotation={[0, VENDING.rotationY, 0]}>
      <CuboidCollider args={[WIDTH / 2, HEIGHT / 2, DEPTH / 2]} position={[0, HEIGHT / 2, 0]} />
      <group onClick={onTap(() => requestInteraction(VENDING_ID, useGameStore.getState().nearbyId))}>
        <mesh position-y={HEIGHT / 2}>
          <boxGeometry args={[WIDTH, HEIGHT, DEPTH]} />
          <meshStandardMaterial color="#1c1733" metalness={0.6} roughness={0.4} />
        </mesh>
        <mesh position={[0, HEIGHT / 2, DEPTH / 2 + 0.005]}>
          <planeGeometry args={[WIDTH - 0.1, HEIGHT - 0.1]} />
          <meshStandardMaterial map={front} emissiveMap={front} emissive="#ffffff" emissiveIntensity={0.85} />
        </mesh>
        {[-1, 1].map((side) => (
          <mesh key={side} position={[(side * WIDTH) / 2, HEIGHT / 2, DEPTH / 2]}>
            <boxGeometry args={[0.04, HEIGHT, 0.04]} />
            <meshBasicMaterial color={neon('#ff2bd6', 2)} toneMapped={false} />
          </mesh>
        ))}
      </group>
      <pointLight position={[0, 1.4, 1.2]} color="#ff2bd6" intensity={14} distance={6} />
    </RigidBody>
  );
}
