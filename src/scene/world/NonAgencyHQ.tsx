import { Text } from '@react-three/drei';
import { FONTS } from '@/scene/fonts';
import { neon } from '@/scene/materials/neon';
import { BrandLogo } from './BrandLogo';
import { ACCENTS, buildings, PLAYER_SPAWN } from './cityLayout';

/**
 * The NON.agency billboard stands on the roof of the lowest building at the
 * plaza edge (first building on Services Avenue), facing the plaza.
 */
const HOST_ID = 'services-l0';
const host = buildings.find((building) => building.id === HOST_ID)!;

const BOARD = { width: 9, height: 4.8, depth: 0.3 } as const;
/** Height of the steel legs between the roof and the board. */
const LEG_HEIGHT = 0.8;
/** Board stands on the roof edge facing the plaza, so the roof never hides it. */
const POSITION = { x: host.x, z: host.z + host.depth / 2 - 1.5 } as const;
/** Turned towards the spawn point so it is readable when the visit starts. */
const ROTATION_Y = Math.atan2(PLAYER_SPAWN.x - POSITION.x, PLAYER_SPAWN.z - POSITION.z);

const STEEL = { color: '#1c1830', metalness: 0.8, roughness: 0.4 } as const;

function Frame({ width, height, color }: { width: number; height: number; color: string }) {
  const edge = 0.12;
  const glow = neon(color, 2);
  const edges: { position: [number, number, number]; size: [number, number, number] }[] = [
    { position: [0, height / 2, 0], size: [width + edge, edge, edge] },
    { position: [0, -height / 2, 0], size: [width + edge, edge, edge] },
    { position: [-width / 2, 0, 0], size: [edge, height, edge] },
    { position: [width / 2, 0, 0], size: [edge, height, edge] },
  ];
  return (
    <group>
      {edges.map(({ position, size }) => (
        <mesh key={position.join()} position={position}>
          <boxGeometry args={size} />
          <meshBasicMaterial color={glow} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

/** Rooftop billboard on a steel frame, branded on both faces. */
function RooftopBillboard() {
  const centerY = LEG_HEIGHT + BOARD.height / 2;
  const legX = BOARD.width / 2 - 0.8;

  return (
    <group position={[POSITION.x, host.height, POSITION.z]} rotation-y={ROTATION_Y}>
      {/* Legs with diagonal braces back to the roof. */}
      {[-legX, legX].map((x) => (
        <group key={x}>
          <mesh position={[x, centerY / 2, 0]}>
            <boxGeometry args={[0.25, centerY, 0.25]} />
            <meshStandardMaterial {...STEEL} />
          </mesh>
          <mesh position={[x, LEG_HEIGHT / 2 + 0.6, -0.9]} rotation-x={-0.7}>
            <boxGeometry args={[0.15, 2.8, 0.15]} />
            <meshStandardMaterial {...STEEL} />
          </mesh>
        </group>
      ))}

      <group position-y={centerY}>
        <mesh>
          <boxGeometry args={[BOARD.width, BOARD.height, BOARD.depth]} />
          <meshStandardMaterial color="#07060f" metalness={0.6} roughness={0.4} />
        </mesh>
        {[0, Math.PI].map((rotation) => (
          <group key={rotation} rotation-y={rotation}>
            <group position-z={BOARD.depth / 2 + 0.05}>
              <Frame width={BOARD.width} height={BOARD.height} color={ACCENTS.magenta} />
              <group position-y={0.45}>
                <BrandLogo width={BOARD.width * 0.72} color="#ffffff" />
              </group>
              <Text
                font={FONTS.display}
                position-y={-1.55}
                fontSize={0.36}
                letterSpacing={0.3}
                anchorX="center"
                anchorY="middle"
              >
                NON.AGENCY
                <meshBasicMaterial color={neon(ACCENTS.magenta, 2.2)} toneMapped={false} />
              </Text>
            </group>
          </group>
        ))}
      </group>
      <pointLight position={[0, centerY, 4]} color={ACCENTS.magenta} intensity={40} distance={14} />
    </group>
  );
}

export function NonAgencyHQ() {
  return <RooftopBillboard />;
}
