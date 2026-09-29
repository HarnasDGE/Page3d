import { MeshReflectorMaterial } from '@react-three/drei';
import type { ThreeEvent } from '@react-three/fiber';
import { Vector3 } from 'three';
import { setMoveTarget } from '@/scene/controls/input';
import { neon } from '@/scene/materials/neon';
import { useGameStore } from '@/scene/store/gameStore';
import { clampToWalkable } from './collision';
import { ACCENTS, PLAZA_HALF_SIZE } from './cityLayout';

/** Pointer travel (px) above which a press counts as a camera drag, not a tap. */
const TAP_MAX_DELTA = 8;
const TARGET_RADIUS = 0.5;
const GROUND_SIZE = 400;
const GROUND_COLOR = '#0a0915';

/** Concentric neon rings in the plaza floor. */
function PlazaFloor() {
  const rings = [
    { radius: 6, color: ACCENTS.violet },
    { radius: 10, color: ACCENTS.magenta },
    { radius: PLAZA_HALF_SIZE - 1.5, color: ACCENTS.violet },
  ];
  return (
    <group rotation-x={-Math.PI / 2} position-y={0.015}>
      {rings.map(({ radius, color }) => (
        <mesh key={radius}>
          <ringGeometry args={[radius - 0.06, radius, 96]} />
          <meshBasicMaterial color={neon(color, 1.3)} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

export function Ground() {
  const quality = useGameStore((state) => state.quality);

  const handleTap = (event: ThreeEvent<MouseEvent>) => {
    if (event.delta > TAP_MAX_DELTA) return;
    event.stopPropagation();
    setMoveTarget(clampToWalkable(new Vector3().copy(event.point), TARGET_RADIUS));
  };

  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} onClick={handleTap}>
        <planeGeometry args={[GROUND_SIZE, GROUND_SIZE]} />
        {quality === 'high' ? (
          // Wet asphalt: blurred reflections of the neon above.
          <MeshReflectorMaterial
            color={GROUND_COLOR}
            resolution={512}
            blur={[400, 120]}
            mixBlur={1}
            mixStrength={30}
            mixContrast={1.1}
            roughness={0.7}
            metalness={0.5}
            depthScale={1}
            minDepthThreshold={0.6}
            maxDepthThreshold={1.4}
            mirror={0}
          />
        ) : (
          <meshStandardMaterial color={GROUND_COLOR} roughness={0.35} metalness={0.7} />
        )}
      </mesh>
      <PlazaFloor />
    </group>
  );
}
