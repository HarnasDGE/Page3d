import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Mesh } from 'three';
import { input } from '@/scene/controls/input';
import { ACCENTS } from '@/scene/world/cityLayout';

/** Pulsing ring shown where a tap / click sent the android. */
export function MoveMarker() {
  const ring = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    const mesh = ring.current;
    if (!mesh) return;
    mesh.visible = input.hasMoveTarget;
    if (!mesh.visible) return;
    mesh.position.set(input.moveTarget.x, 0.03, input.moveTarget.z);
    const pulse = 1 + Math.sin(clock.elapsedTime * 6) * 0.12;
    mesh.scale.setScalar(pulse);
  });

  return (
    <mesh ref={ring} rotation-x={-Math.PI / 2} visible={false}>
      <ringGeometry args={[0.35, 0.5, 32]} />
      <meshBasicMaterial color={ACCENTS.cyan} transparent opacity={0.85} toneMapped={false} />
    </mesh>
  );
}
