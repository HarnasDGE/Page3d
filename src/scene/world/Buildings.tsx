import { useMemo } from 'react';
import { BoxGeometry, MeshBasicMaterial } from 'three';
import { neon } from '@/scene/materials/neon';
import { createFacadeMaterial } from '@/scene/materials/facadeMaterial';
import { buildings, type Building } from './cityLayout';
import { blockTap } from './events';
import { venueByBuilding } from './venues';

const TRIM_HEIGHT = 0.25;
const BAND_HEIGHT = 0.12;
const BAND_STEP = 9.6;

const accentOf = (building: Building) => venueByBuilding.get(building.id)?.accent ?? building.accent;

function BuildingBlock({
  building,
  geometry,
  bodyMaterial,
  accentMaterial,
}: {
  building: Building;
  geometry: BoxGeometry;
  bodyMaterial: ReturnType<typeof createFacadeMaterial>;
  accentMaterial: MeshBasicMaterial;
}) {
  const { x, z, width, depth, height } = building;
  const bands = Math.floor(height / BAND_STEP);

  return (
    <group position={[x, 0, z]} onClick={blockTap}>
      <mesh
        geometry={geometry}
        material={bodyMaterial}
        position-y={height / 2}
        scale={[width, height, depth]}
      />
      <mesh
        geometry={geometry}
        material={accentMaterial}
        position-y={height}
        scale={[width + 0.2, TRIM_HEIGHT, depth + 0.2]}
      />
      {Array.from({ length: bands }, (_, i) => (
        <mesh
          key={i}
          geometry={geometry}
          material={accentMaterial}
          position-y={(i + 1) * BAND_STEP}
          scale={[width + 0.04, BAND_HEIGHT, depth + 0.04]}
        />
      ))}
    </group>
  );
}

export function Buildings() {
  const geometry = useMemo(() => new BoxGeometry(1, 1, 1), []);
  const bodyMaterial = useMemo(() => createFacadeMaterial('#2a2350'), []);
  const accentMaterials = useMemo(() => {
    const map = new Map<string, MeshBasicMaterial>();
    for (const building of buildings) {
      const accent = accentOf(building);
      if (!map.has(accent)) {
        map.set(accent, new MeshBasicMaterial({ color: neon(accent, 1.8), toneMapped: false }));
      }
    }
    return map;
  }, []);

  return (
    <group>
      {buildings.map((building) => (
        <BuildingBlock
          key={building.id}
          building={building}
          geometry={geometry}
          bodyMaterial={bodyMaterial}
          accentMaterial={accentMaterials.get(accentOf(building))!}
        />
      ))}
    </group>
  );
}
