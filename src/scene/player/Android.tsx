import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import { MathUtils, type Group } from 'three';
import { ACCENTS } from '@/scene/world/cityLayout';
import { player, RUN_SPEED } from './playerState';

const BODY_COLOR = '#d9dcef';
const JOINT_COLOR = '#2a2545';

function Limb({ width, length, color }: { width: number; length: number; color: string }) {
  return (
    <mesh position-y={-length / 2}>
      <boxGeometry args={[width, length, width * 1.1]} />
      <meshStandardMaterial color={color} metalness={0.5} roughness={0.35} />
    </mesh>
  );
}

/** Procedural android avatar with idle / walk / run animation. Faces +Z. */
export function Android() {
  const body = useRef<Group>(null);
  const head = useRef<Group>(null);
  const leftLeg = useRef<Group>(null);
  const rightLeg = useRef<Group>(null);
  const leftArm = useRef<Group>(null);
  const rightArm = useRef<Group>(null);
  const phase = useRef(0);

  useFrame(({ clock }, delta) => {
    const intensity = MathUtils.clamp(player.speed / RUN_SPEED, 0, 1);
    phase.current += delta * (2 + player.speed * 1.6);

    const swing = Math.sin(phase.current) * (0.2 + intensity * 0.7) * Math.min(player.speed, 1);
    const bob = Math.abs(Math.cos(phase.current)) * 0.08 * Math.min(player.speed, 1);
    const breathe = Math.sin(clock.elapsedTime * 2) * 0.015;

    if (leftLeg.current && rightLeg.current) {
      leftLeg.current.rotation.x = swing;
      rightLeg.current.rotation.x = -swing;
    }
    if (leftArm.current && rightArm.current) {
      leftArm.current.rotation.x = -swing * 0.9;
      rightArm.current.rotation.x = swing * 0.9;
    }
    if (body.current) {
      body.current.position.y = bob + breathe;
      body.current.rotation.x = intensity * 0.18;
    }
    if (head.current) {
      head.current.rotation.y = Math.sin(clock.elapsedTime * 0.7) * 0.15 * (1 - intensity);
    }
  });

  return (
    <group>
      <group ref={body}>
        {/* Torso */}
        <RoundedBox args={[0.62, 0.6, 0.38]} radius={0.1} position-y={1.1}>
          <meshStandardMaterial color={BODY_COLOR} metalness={0.4} roughness={0.3} />
        </RoundedBox>
        <mesh position={[0, 1.16, 0.2]}>
          <boxGeometry args={[0.3, 0.05, 0.02]} />
          <meshBasicMaterial color={ACCENTS.magenta} toneMapped={false} />
        </mesh>

        {/* Head */}
        <group ref={head} position-y={1.62}>
          <RoundedBox args={[0.52, 0.42, 0.44]} radius={0.12}>
            <meshStandardMaterial color={BODY_COLOR} metalness={0.4} roughness={0.3} />
          </RoundedBox>
          <mesh position={[0, 0.02, 0.215]}>
            <boxGeometry args={[0.42, 0.13, 0.03]} />
            <meshBasicMaterial color={ACCENTS.cyan} toneMapped={false} />
          </mesh>
          <mesh position={[0.16, 0.3, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 0.22]} />
            <meshStandardMaterial color={JOINT_COLOR} />
          </mesh>
          <mesh position={[0.16, 0.42, 0]}>
            <sphereGeometry args={[0.04, 12, 12]} />
            <meshBasicMaterial color={ACCENTS.magenta} toneMapped={false} />
          </mesh>
        </group>

        {/* Arms */}
        <group ref={leftArm} position={[-0.4, 1.34, 0]}>
          <Limb width={0.14} length={0.56} color={BODY_COLOR} />
        </group>
        <group ref={rightArm} position={[0.4, 1.34, 0]}>
          <Limb width={0.14} length={0.56} color={BODY_COLOR} />
        </group>
      </group>

      {/* Legs */}
      <group ref={leftLeg} position={[-0.15, 0.78, 0]}>
        <Limb width={0.18} length={0.76} color={JOINT_COLOR} />
      </group>
      <group ref={rightLeg} position={[0.15, 0.78, 0]}>
        <Limb width={0.18} length={0.76} color={JOINT_COLOR} />
      </group>
    </group>
  );
}
