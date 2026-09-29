import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { AdditiveBlending, BufferAttribute, BufferGeometry, PointsMaterial, Vector3 } from 'three';
import { neon } from '@/scene/materials/neon';

const COUNT = 60;
const GRAVITY = 9.81;

interface SparksProps {
  active: boolean;
  /** Increment to fire an extra burst right now (e.g. on an electric shock). */
  burstKey?: number;
  color?: string;
}

/** Short-lived electric sparks spraying from the group origin in random bursts. */
export function Sparks({ active, burstKey = 0, color = '#9ff7ff' }: SparksProps) {
  const state = useRef({
    velocities: Array.from({ length: COUNT }, () => new Vector3()),
    life: new Float32Array(COUNT),
    nextBurst: 0,
    lastBurstKey: burstKey,
  }).current;
  const geometry = useMemo(() => {
    const result = new BufferGeometry();
    result.setAttribute('position', new BufferAttribute(new Float32Array(COUNT * 3), 3));
    return result;
  }, []);
  const material = useMemo(
    () =>
      new PointsMaterial({
        color: neon(color, 3),
        size: 0.06,
        transparent: true,
        blending: AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
      }),
    [color],
  );
  const cursor = useRef(0);

  const burst = (amount: number) => {
    const positions = geometry.attributes.position as BufferAttribute;
    for (let i = 0; i < amount; i++) {
      const index = cursor.current++ % COUNT;
      positions.setXYZ(index, 0, 0, 0);
      state.velocities[index].set((Math.random() - 0.5) * 3, Math.random() * 2.5, Math.random() * 2.2);
      state.life[index] = 0.4 + Math.random() * 0.5;
    }
  };

  useFrame(({ clock }, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const now = clock.elapsedTime;

    if (burstKey !== state.lastBurstKey) {
      state.lastBurstKey = burstKey;
      burst(COUNT);
    }
    if (active && now > state.nextBurst) {
      burst(8 + Math.floor(Math.random() * 12));
      state.nextBurst = now + 0.4 + Math.random() * 1.6;
    }

    const positions = geometry.attributes.position as BufferAttribute;
    for (let i = 0; i < COUNT; i++) {
      if (state.life[i] <= 0) {
        positions.setY(i, -1000); // parked out of sight
        continue;
      }
      state.life[i] -= delta;
      const velocity = state.velocities[i];
      velocity.y -= GRAVITY * delta;
      positions.setXYZ(
        i,
        positions.getX(i) + velocity.x * delta,
        positions.getY(i) + velocity.y * delta,
        positions.getZ(i) + velocity.z * delta,
      );
    }
    positions.needsUpdate = true;
  });

  return <points geometry={geometry} material={material} frustumCulled={false} />;
}
