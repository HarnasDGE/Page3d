import { Grid } from '@react-three/drei';
import type { ThreeEvent } from '@react-three/fiber';
import { Vector3 } from 'three';
import { setMoveTarget } from '@/scene/controls/input';
import { clampToWalkable } from './collision';
import { plazaArea, streets, type Rect } from './cityLayout';

/** Pointer travel (px) above which a press counts as a camera drag, not a tap. */
const TAP_MAX_DELTA = 8;
const TARGET_RADIUS = 0.5;

function RoadSurface({ rect, color }: { rect: Rect; color: string }) {
  const width = rect.maxX - rect.minX;
  const depth = rect.maxZ - rect.minZ;
  return (
    <mesh
      rotation-x={-Math.PI / 2}
      position={[(rect.minX + rect.maxX) / 2, 0.005, (rect.minZ + rect.maxZ) / 2]}
    >
      <planeGeometry args={[width, depth]} />
      <meshStandardMaterial color={color} roughness={0.35} metalness={0.6} />
    </mesh>
  );
}

export function Ground() {
  const handleTap = (event: ThreeEvent<MouseEvent>) => {
    if (event.delta > TAP_MAX_DELTA) return;
    event.stopPropagation();
    setMoveTarget(clampToWalkable(new Vector3().copy(event.point), TARGET_RADIUS));
  };

  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} onClick={handleTap}>
        <planeGeometry args={[400, 400]} />
        <meshStandardMaterial color="#0a0915" roughness={0.9} />
      </mesh>

      <RoadSurface rect={plazaArea} color="#141127" />
      {streets.map((street) => (
        <RoadSurface key={street.id} rect={street.area} color="#110f20" />
      ))}

      <Grid
        position-y={0.01}
        args={[400, 400]}
        cellSize={2}
        cellThickness={0.6}
        cellColor="#1d1840"
        sectionSize={10}
        sectionThickness={1}
        sectionColor="#3a2a7a"
        fadeDistance={90}
        fadeStrength={1.5}
        infiniteGrid
      />
    </group>
  );
}
