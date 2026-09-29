import { Suspense } from 'react';
import { MeshReflectorMaterial } from '@react-three/drei';
import { aimAtFloor, stopAiming, tapToMove } from '@/scene/controls/tapToMove';
import { neon } from '@/scene/materials/neon';
import { useGameStore } from '@/scene/store/gameStore';
import { ROAD_TEXTURES } from '@/scene/textures/assets';
import { useDecalTexture } from '@/scene/textures/useDecalTexture';
import { ACCENTS, PLAZA_HALF_SIZE } from './cityLayout';

const GROUND_SIZE = 400;
const GROUND_COLOR = '#0a0915';
/** Tint multiplied over the asphalt texture. */
const ASPHALT_TINT = '#c4bfe0';
/** World units covered by one asphalt tile. */
const ASPHALT_TILE = 6;

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

/** Wet asphalt: tiled SVG texture plus blurred reflections of the neon above. */
function AsphaltMaterial() {
  const quality = useGameStore((state) => state.quality);
  const tiles = GROUND_SIZE / ASPHALT_TILE;
  const map = useDecalTexture(ROAD_TEXTURES.asphalt, { repeat: [tiles, tiles] });

  return quality === 'high' ? (
    <MeshReflectorMaterial
      map={map}
      color={ASPHALT_TINT}
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
    <meshStandardMaterial map={map} color={ASPHALT_TINT} roughness={0.35} metalness={0.7} />
  );
}

export function Ground() {
  return (
    <group>
      <mesh
        rotation-x={-Math.PI / 2}
        onClick={tapToMove}
        onPointerMove={aimAtFloor}
        onPointerOut={stopAiming}
      >
        <planeGeometry args={[GROUND_SIZE, GROUND_SIZE]} />
        <Suspense fallback={<meshStandardMaterial color={GROUND_COLOR} roughness={0.35} metalness={0.7} />}>
          <AsphaltMaterial />
        </Suspense>
      </mesh>
      <PlazaFloor />
    </group>
  );
}
