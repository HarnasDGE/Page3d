import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { AdditiveBlending, BufferAttribute, BufferGeometry, ShaderMaterial, Vector3 } from 'three';
import { player } from '@/scene/player/playerState';
import { useGameStore } from '@/scene/store/gameStore';

const AREA = 60;
const HEIGHT = 30;
const SPEED = 26;
const STREAK = 0.7;

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform vec3 uCenter;
  attribute vec3 aDrop;
  attribute float aTail;
  varying float vTail;

  void main() {
    vec3 p;
    // World-anchored drops that wrap around the player, so rain never runs out.
    p.x = uCenter.x + mod(aDrop.x - uCenter.x, ${AREA.toFixed(1)}) - ${(AREA / 2).toFixed(1)};
    p.z = uCenter.z + mod(aDrop.z - uCenter.z, ${AREA.toFixed(1)}) - ${(AREA / 2).toFixed(1)};
    p.y = mod(aDrop.y - uTime * ${SPEED.toFixed(1)}, ${HEIGHT.toFixed(1)});
    p.y += aTail * ${STREAK.toFixed(2)};
    p.x += aTail * 0.08;
    vTail = aTail;
    gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  varying float vTail;
  void main() {
    gl_FragColor = vec4(0.55, 0.75, 1.0, 0.08 + vTail * 0.22);
  }
`;

function createRainGeometry(count: number) {
  const drops = new Float32Array(count * 6);
  const tails = new Float32Array(count * 2);
  for (let i = 0; i < count; i++) {
    const x = Math.random() * AREA;
    const y = Math.random() * HEIGHT;
    const z = Math.random() * AREA;
    drops.set([x, y, z, x, y, z], i * 6);
    tails.set([0, 1], i * 2);
  }
  const geometry = new BufferGeometry();
  // `position` is required by three but unused: the shader places every vertex.
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(count * 6), 3));
  geometry.setAttribute('aDrop', new BufferAttribute(drops, 3));
  geometry.setAttribute('aTail', new BufferAttribute(tails, 1));
  return geometry;
}

/** GPU-animated rain streaks following the player. */
export function Rain() {
  const quality = useGameStore((state) => state.quality);
  const count = quality === 'high' ? 2200 : 800;

  const geometry = useMemo(() => createRainGeometry(count), [count]);
  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: { uTime: { value: 0 }, uCenter: { value: new Vector3() } },
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
      }),
    [],
  );

  useFrame(({ clock }) => {
    material.uniforms.uTime.value = clock.elapsedTime;
    material.uniforms.uCenter.value.copy(player.position);
  });

  return <lineSegments geometry={geometry} material={material} frustumCulled={false} />;
}
