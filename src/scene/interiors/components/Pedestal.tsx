import { useRef, type ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group } from 'three';
import { neon } from '@/scene/materials/neon';
import { blockTap } from '@/scene/world/events';
import { EXHIBIT } from '../roomLayout';

const HOLOGRAM_HEIGHT = 2.5;

/** Central pedestal with a slowly spinning, floating hologram on top. */
export function Pedestal({ accent, children }: { accent: string; children: ReactNode }) {
  const hologram = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (!hologram.current) return;
    hologram.current.rotation.y = clock.elapsedTime * 0.5;
    hologram.current.position.y = HOLOGRAM_HEIGHT + Math.sin(clock.elapsedTime * 1.3) * 0.08;
  });

  return (
    <group position={[EXHIBIT.x, 0, EXHIBIT.z]} onClick={blockTap}>
      <mesh position-y={0.4}>
        <boxGeometry args={[EXHIBIT.halfSize * 2, 0.8, EXHIBIT.halfSize * 2]} />
        <meshStandardMaterial color="#1a1530" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position-y={0.82} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[1.1, 1.25, 48]} />
        <meshBasicMaterial color={neon(accent, 2.4)} toneMapped={false} />
      </mesh>
      <mesh position-y={1.6}>
        <cylinderGeometry args={[1.05, 1.2, 1.5, 32, 1, true]} />
        <meshBasicMaterial color={neon(accent, 0.6)} transparent opacity={0.12} toneMapped={false} />
      </mesh>
      <group ref={hologram}>{children}</group>
      <pointLight position-y={2.4} color={accent} intensity={25} distance={9} />
    </group>
  );
}
