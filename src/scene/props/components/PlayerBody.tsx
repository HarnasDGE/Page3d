import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { CapsuleCollider, RigidBody, type RapierRigidBody } from '@react-three/rapier';
import { player } from '@/scene/player/playerState';

export const PLAYER_BODY_NAME = 'player';

/**
 * Kinematic stand-in for the android. The android still moves with our own
 * lightweight collision system; this body just follows it so it can shove cans
 * and the trash bin around.
 */
export function PlayerBody() {
  const body = useRef<RapierRigidBody>(null);

  useFrame(() => {
    body.current?.setNextKinematicTranslation({ x: player.position.x, y: 0, z: player.position.z });
  });

  return (
    <RigidBody
      ref={body}
      name={PLAYER_BODY_NAME}
      type="kinematicPosition"
      colliders={false}
      position={[player.position.x, 0, player.position.z]}
    >
      <CapsuleCollider args={[0.5, 0.4]} position={[0, 0.9, 0]} />
    </RigidBody>
  );
}
