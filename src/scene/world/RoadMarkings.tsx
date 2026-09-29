import type { Texture } from 'three';
import { ROAD_TEXTURES } from '@/scene/textures/assets';
import { useDecalTexture } from '@/scene/textures/useDecalTexture';
import { PLAZA_HALF_SIZE, STREET_HALF_WIDTH, STREET_ROTATION, streets } from './cityLayout';

// Authored in local street space (street runs from the plaza towards -Z).
const STREET_START = -PLAZA_HALF_SIZE;
const DECAL_Y = 0.012;
const PAINT_COLOR = '#b9b6c8';

const CROSSWALK = { z: STREET_START - 3, depth: 3 } as const;
const ARROWS = [
  { x: 2.5, z: STREET_START - 11, rotation: 0 },
  { x: -2.5, z: STREET_START - 13, rotation: Math.PI },
  { x: 2.5, z: STREET_START - 41, rotation: 0 },
  { x: -2.5, z: STREET_START - 43, rotation: Math.PI },
];
const MANHOLES = [
  { x: 1.4, z: STREET_START - 24 },
  { x: -2.6, z: STREET_START - 50 },
];

interface DecalProps {
  map: Texture;
  position: [number, number];
  size: [number, number];
  rotation?: number;
  color?: string;
}

/** Flat texture lying on the road, offset to avoid z-fighting with the asphalt. */
function Decal({ map, position: [x, z], size, rotation = 0, color = PAINT_COLOR }: DecalProps) {
  return (
    <mesh position={[x, DECAL_Y, z]} rotation={[-Math.PI / 2, 0, rotation]}>
      <planeGeometry args={size} />
      <meshStandardMaterial
        map={map}
        color={color}
        // Retro-reflective paint: stays readable in the dark street.
        emissiveMap={map}
        emissive="#8a879c"
        emissiveIntensity={0.3}
        transparent
        depthWrite={false}
        polygonOffset
        polygonOffsetFactor={-2}
        roughness={0.8}
      />
    </mesh>
  );
}

/** Crosswalks, lane arrows and manholes on every street. */
export function RoadMarkings() {
  const crosswalk = useDecalTexture(ROAD_TEXTURES.crosswalk);
  const arrow = useDecalTexture(ROAD_TEXTURES.arrow);
  const manhole = useDecalTexture(ROAD_TEXTURES.manhole);

  return (
    <group>
      {streets.map((street) => (
        <group key={street.id} rotation-y={STREET_ROTATION[street.id]}>
          <Decal
            map={crosswalk}
            position={[0, CROSSWALK.z]}
            size={[STREET_HALF_WIDTH * 2 - 0.6, CROSSWALK.depth]}
          />
          {ARROWS.map(({ x, z, rotation }) => (
            <Decal key={`${x}:${z}`} map={arrow} position={[x, z]} size={[0.8, 2]} rotation={rotation} />
          ))}
          {MANHOLES.map(({ x, z }) => (
            <Decal key={`${x}:${z}`} map={manhole} position={[x, z]} size={[1.3, 1.3]} color="#ffffff" />
          ))}
        </group>
      ))}
    </group>
  );
}
