import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { CylinderCollider, RigidBody, type RapierRigidBody } from '@react-three/rapier';
import { registerInteractable, requestInteraction } from '@/scene/interaction/interactables';
import { useGameStore } from '@/scene/store/gameStore';
import { onTap } from '@/scene/world/events';
import { usePropsStore, type CanState } from '../propsStore';
import { CAN_HALF_HEIGHT, CAN_RADIUS, CanModel } from './CanModel';

/** Last simulated position of every loose can, saved when the street unmounts. */
export const canPositions = new Map<string, [number, number, number]>();

const isPickupEnabled = () => {
  const { heldCanId, minigame } = usePropsStore.getState();
  return heldCanId === null && minigame === null;
};

/** Tapping a can walks over and picks it up (onTap throws instead while holding one). */
const handleCanTap = (id: string) =>
  onTap(() => requestInteraction(`can:${id}`, useGameStore.getState().nearbyId));

function Can({ can }: { can: CanState }) {
  const body = useRef<RapierRigidBody>(null);
  const spot = useMemo(() => ({ x: can.position[0], z: can.position[2] }), [can.position]);

  useEffect(
    () =>
      registerInteractable({
        id: `can:${can.id}`,
        label: 'Pick up can',
        spot,
        // Wider than the android's physics capsule, so it triggers before bumping the can.
        radius: 1.4,
        activate: () => usePropsStore.getState().pickUp(can.id),
        isEnabled: isPickupEnabled,
      }),
    [can.id, spot],
  );

  useFrame(() => {
    const rigidBody = body.current;
    if (!rigidBody) return;
    const { x, y, z } = rigidBody.translation();
    // The interaction spot follows the can as it rolls around.
    spot.x = x;
    spot.z = z;
    canPositions.set(can.id, [x, Math.max(y, 0.3), z]);
  });

  return (
    <RigidBody
      ref={body}
      colliders={false}
      position={can.position}
      linearVelocity={can.velocity}
      angularDamping={0.6}
      ccd
      userData={{ kind: 'can', id: can.id }}
    >
      <CylinderCollider args={[CAN_HALF_HEIGHT, CAN_RADIUS]} density={3} restitution={0.35} friction={0.7} />
      <group onClick={handleCanTap(can.id)}>
        <CanModel variant={can.variant} />
        {/* Generous invisible hit area so cans are easy to tap on phones. */}
        <mesh>
          <sphereGeometry args={[0.45, 8, 8]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      </group>
    </RigidBody>
  );
}

/** Every loose can in the district; the held one lives in the android's hand. */
export function Cans() {
  const cans = usePropsStore((state) => state.cans);
  const heldCanId = usePropsStore((state) => state.heldCanId);

  useEffect(() => {
    canPositions.forEach((_, id) => {
      if (!cans.some((can) => can.id === id)) canPositions.delete(id);
    });
  }, [cans]);

  return (
    <>
      {cans
        .filter((can) => can.id !== heldCanId)
        .map((can) => (
          <Can key={`${can.id}:${can.generation}`} can={can} />
        ))}
    </>
  );
}
