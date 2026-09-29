import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Mesh } from 'three';
import { neon } from '@/scene/materials/neon';
import { ACCENTS } from './cityLayout';

/** Placeholder centrepiece of the plaza; becomes the intro hologram later. */
export function PlazaHologram() {
  const hologram = useRef<Mesh>(null);

  useFrame(({ clock }, delta) => {
    if (!hologram.current) return;
    hologram.current.rotation.y += delta * 0.6;
    hologram.current.position.y = 3.2 + Math.sin(clock.elapsedTime * 1.4) * 0.15;
  });

  return (
    <group>
      <mesh position-y={0.4}>
        <cylinderGeometry args={[1.9, 2.1, 0.8, 32]} />
        <meshStandardMaterial color="#1a1530" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position-y={0.82} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[1.5, 1.7, 48]} />
        <meshBasicMaterial color={neon(ACCENTS.cyan, 2.4)} toneMapped={false} />
      </mesh>
      <mesh ref={hologram}>
        <octahedronGeometry args={[1.1, 0]} />
        <meshBasicMaterial color={neon(ACCENTS.cyan, 2.4)} wireframe toneMapped={false} />
      </mesh>
      <pointLight position={[0, 3, 0]} color={ACCENTS.cyan} intensity={25} distance={16} />
    </group>
  );
}
