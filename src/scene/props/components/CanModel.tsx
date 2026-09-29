import { neon } from '@/scene/materials/neon';

export const CAN_RADIUS = 0.15;
export const CAN_HALF_HEIGHT = 0.2;

const VARIANTS = [
  { body: '#d81b9c', band: '#00f0ff' },
  { body: '#0f7c8c', band: '#ffb800' },
  { body: '#3a2a8c', band: '#ff2bd6' },
] as const;

/** Soda can: coloured body, glowing label band and a metal top. */
export function CanModel({ variant }: { variant: number }) {
  const colors = VARIANTS[variant % VARIANTS.length];
  const height = CAN_HALF_HEIGHT * 2;

  return (
    <group>
      <mesh>
        <cylinderGeometry args={[CAN_RADIUS, CAN_RADIUS, height, 16]} />
        <meshStandardMaterial color={colors.body} metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh>
        <cylinderGeometry args={[CAN_RADIUS + 0.004, CAN_RADIUS + 0.004, 0.06, 16, 1, true]} />
        <meshBasicMaterial color={neon(colors.band, 1.8)} toneMapped={false} />
      </mesh>
      <mesh position-y={CAN_HALF_HEIGHT + 0.005}>
        <cylinderGeometry args={[CAN_RADIUS * 0.92, CAN_RADIUS, 0.01, 16]} />
        <meshStandardMaterial color="#c9ccd8" metalness={0.9} roughness={0.25} />
      </mesh>
    </group>
  );
}
