import { useMemo } from 'react';
import type { ThreeEvent } from '@react-three/fiber';
import { BoxGeometry, MeshStandardMaterial } from 'three';
import { buildings, type Building } from './cityLayout';

const TRIM_HEIGHT = 0.25;
const BAND_HEIGHT = 0.12;

/** Stops taps on a building from falling through to the ground behind it. */
const blockTap = (event: ThreeEvent<MouseEvent>) => event.stopPropagation();

function BuildingBlock({
  building,
  geometry,
  bodyMaterial,
  accentMaterial,
}: {
  building: Building;
  geometry: BoxGeometry;
  bodyMaterial: MeshStandardMaterial;
  accentMaterial: MeshStandardMaterial;
}) {
  const { x, z, width, depth, height } = building;
  const bands = Math.floor(height / 6);

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
          position-y={(i + 1) * 6 - 1}
          scale={[width + 0.04, BAND_HEIGHT, depth + 0.04]}
        />
      ))}
    </group>
  );
}

export function Buildings() {
  const geometry = useMemo(() => new BoxGeometry(1, 1, 1), []);
  const bodyMaterial = useMemo(
    () => new MeshStandardMaterial({ color: '#1a1535', roughness: 0.7, metalness: 0.3 }),
    [],
  );
  const accentMaterials = useMemo(() => {
    const map = new Map<string, MeshStandardMaterial>();
    for (const { accent } of buildings) {
      if (!map.has(accent)) {
        map.set(
          accent,
          new MeshStandardMaterial({
            color: accent,
            emissive: accent,
            emissiveIntensity: 1.6,
            toneMapped: false,
          }),
        );
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
          accentMaterial={accentMaterials.get(building.accent)!}
        />
      ))}
    </group>
  );
}
