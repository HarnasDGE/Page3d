import { useRef } from 'react';
import { useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import type { MeshStandardMaterial, Texture } from 'three';
import { FACADE_TEXTURES, GRAFFITI, POSTERS } from '@/scene/textures/assets';
import { buildings, facingRotation, type Building } from './cityLayout';
import { venueByBuilding } from './venues';

/** Distance in front of the facade, enough to avoid z-fighting. */
const FACADE_OFFSET = 0.05;
const POSTER_SIZE: [number, number] = [1.5, 2.25];
const POSTER_X = 3.1;
const POSTER_Y = 2.3;
const GRAFFITI_SIZE: [number, number] = [2.6, 1.3];
const SHUTTER_SIZE: [number, number] = [3.2, 2.8];

/** Decorative street buildings: everything that is not a venue or a plaza tower. */
const decoratedBuildings = buildings.filter(
  (building, index) =>
    building.street !== 'plaza' &&
    !venueByBuilding.has(building.id) &&
    // Ring road buildings are many; decorating every other one keeps draw calls in check.
    (building.street !== 'ring' || index % 2 === 0),
);

function Poster({ map, x, flicker }: { map: Texture; x: number; flicker: boolean }) {
  const material = useRef<MeshStandardMaterial>(null);

  useFrame(({ clock }) => {
    if (!flicker || !material.current) return;
    // Mostly on, with short irregular drop-outs like a failing backlight.
    const t = clock.elapsedTime;
    const off = Math.sin(t * 13.1) * Math.sin(t * 3.7) > 0.82;
    material.current.emissiveIntensity = off ? 0.08 : 0.6;
  });

  return (
    <mesh position={[x, POSTER_Y, 0]}>
      <planeGeometry args={POSTER_SIZE} />
      <meshStandardMaterial
        ref={material}
        map={map}
        emissiveMap={map}
        emissive="#ffffff"
        emissiveIntensity={0.6}
        roughness={0.5}
      />
    </mesh>
  );
}

function BuildingDecor({ building, index, posters, graffiti, shutter }: {
  building: Building;
  index: number;
  posters: Texture[];
  graffiti: Texture[];
  shutter: Texture;
}) {
  return (
    <group
      position={[building.door.x, 0, building.door.z]}
      rotation-y={facingRotation(building)}
    >
      <group position-z={FACADE_OFFSET}>
        <mesh position-y={SHUTTER_SIZE[1] / 2}>
          <planeGeometry args={SHUTTER_SIZE} />
          <meshStandardMaterial map={shutter} roughness={0.6} metalness={0.4} />
        </mesh>

        <Poster map={posters[index % posters.length]} x={-POSTER_X} flicker={index % 5 === 2} />
        <Poster map={posters[(index + 1) % posters.length]} x={POSTER_X} flicker={false} />

        {index % 2 === 0 && (
          <mesh position={[-POSTER_X - 2.3, GRAFFITI_SIZE[1] / 2 + 0.4, 0.01]}>
            <planeGeometry args={GRAFFITI_SIZE} />
            <meshStandardMaterial
              map={graffiti[(index / 2) % graffiti.length]}
              emissiveMap={graffiti[(index / 2) % graffiti.length]}
              emissive="#ffffff"
              emissiveIntensity={0.25}
              transparent
              depthWrite={false}
              roughness={0.9}
            />
          </mesh>
        )}
      </group>
    </group>
  );
}

/** Roller shutters, backlit posters and graffiti on non-venue buildings. */
export function FacadeDecor() {
  const posters = useTexture([...POSTERS]);
  const graffiti = useTexture([...GRAFFITI]);
  const shutter = useTexture(FACADE_TEXTURES.shutter);

  return (
    <group>
      {decoratedBuildings.map((building, index) => (
        <BuildingDecor
          key={building.id}
          building={building}
          index={index}
          posters={posters}
          graffiti={graffiti}
          shutter={shutter}
        />
      ))}
    </group>
  );
}
