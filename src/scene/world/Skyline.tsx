import { useLayoutEffect, useMemo, useRef } from 'react';
import { Object3D, type InstancedMesh } from 'three';
import { createFacadeMaterial } from '@/scene/materials/facadeMaterial';

const COUNT = 140;
// Outside the ring road's outer buildings (corners reach ~94·√2 ≈ 133).
const MIN_RADIUS = 145;
const MAX_RADIUS = 210;

/** Deterministic pseudo-random so the skyline is identical on every visit. */
function random(seed: number) {
  const x = Math.sin(seed * 127.1) * 43758.5453;
  return x - Math.floor(x);
}

/** Distant towers ringing the district; purely decorative, one draw call. */
export function Skyline() {
  const mesh = useRef<InstancedMesh>(null);
  const material = useMemo(() => createFacadeMaterial('#1c1638'), []);

  useLayoutEffect(() => {
    const instanced = mesh.current;
    if (!instanced) return;
    const dummy = new Object3D();
    for (let i = 0; i < COUNT; i++) {
      const angle = (i / COUNT) * Math.PI * 2 + random(i) * 0.05;
      const radius = MIN_RADIUS + random(i + 100) * (MAX_RADIUS - MIN_RADIUS);
      const height = 30 + random(i + 200) ** 2 * 90;
      const width = 8 + random(i + 300) * 12;
      dummy.position.set(Math.cos(angle) * radius, height / 2, Math.sin(angle) * radius);
      dummy.scale.set(width, height, width);
      dummy.updateMatrix();
      instanced.setMatrixAt(i, dummy.matrix);
    }
    instanced.instanceMatrix.needsUpdate = true;
  }, []);

  return (
    <instancedMesh ref={mesh} args={[undefined, material, COUNT]}>
      <boxGeometry />
    </instancedMesh>
  );
}
