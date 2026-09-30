import { useMemo } from 'react';
import { useTexture } from '@react-three/drei';
import { MeshStandardMaterial } from 'three';
import { CAN_LABELS } from '@/scene/textures/assets';

export const CAN_RADIUS = 0.15;
export const CAN_HALF_HEIGHT = 0.2;

// Profile of a standard 330 ml can (bottom → top), scaled to the collider.
const BOTTOM_Y = -CAN_HALF_HEIGHT;
const BODY_START = BOTTOM_Y + 0.025;
const BODY_END = CAN_HALF_HEIGHT - 0.05;
const LID_Y = CAN_HALF_HEIGHT - 0.015;
const NECK_RADIUS = CAN_RADIUS * 0.8;
const BODY_HEIGHT = BODY_END - BODY_START;

/** Brushed aluminium for lid and base; a touch of emission keeps it readable at night. */
function useAluminium() {
  return useMemo(
    () =>
      new MeshStandardMaterial({
        color: '#cfd4de',
        metalness: 0.45,
        roughness: 0.3,
        emissive: '#3a3f4a',
        emissiveIntensity: 0.4,
      }),
    [],
  );
}

/** Realistic soda can: printed label, tapered neck, lid with a pull tab. */
export function CanModel({ variant }: { variant: number }) {
  const labels = useTexture([...CAN_LABELS]);
  const aluminium = useAluminium();
  const label = labels[variant % labels.length];
  const body = useMemo(
    () =>
      new MeshStandardMaterial({
        map: label,
        metalness: 0.25,
        roughness: 0.35,
        // Slight self-light so the print stays visible in the dark street.
        emissiveMap: label,
        emissive: '#ffffff',
        emissiveIntensity: 0.18,
      }),
    [label],
  );

  return (
    <group>
      {/* Base: tapers in towards the bottom dome. */}
      <mesh position-y={(BOTTOM_Y + BODY_START) / 2} material={aluminium}>
        <cylinderGeometry args={[CAN_RADIUS, CAN_RADIUS * 0.85, BODY_START - BOTTOM_Y, 24]} />
      </mesh>
      <mesh position-y={BODY_START + BODY_HEIGHT / 2} material={body}>
        <cylinderGeometry args={[CAN_RADIUS, CAN_RADIUS, BODY_HEIGHT, 32, 1, true]} />
      </mesh>
      {/* Shoulder narrowing to the neck. */}
      <mesh position-y={(BODY_END + LID_Y) / 2} material={aluminium}>
        <cylinderGeometry args={[NECK_RADIUS, CAN_RADIUS, LID_Y - BODY_END, 24, 1, true]} />
      </mesh>
      <mesh position-y={LID_Y + 0.0075} material={aluminium}>
        <cylinderGeometry args={[NECK_RADIUS, NECK_RADIUS, 0.015, 24]} />
      </mesh>
      <mesh position-y={CAN_HALF_HEIGHT} rotation-x={Math.PI / 2} material={aluminium}>
        <torusGeometry args={[NECK_RADIUS, 0.006, 6, 24]} />
      </mesh>
      {/* Pull tab */}
      <mesh position={[0, CAN_HALF_HEIGHT + 0.002, 0.03]} material={aluminium}>
        <boxGeometry args={[0.035, 0.004, 0.06]} />
      </mesh>
    </group>
  );
}
