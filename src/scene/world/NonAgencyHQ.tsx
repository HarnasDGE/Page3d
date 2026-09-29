import { Text } from '@react-three/drei';
import { FONTS } from '@/scene/fonts';
import { neon } from '@/scene/materials/neon';
import { BrandLogo } from './BrandLogo';
import { ACCENTS, BRAND_BILLBOARD, buildings } from './cityLayout';
import { blockTap } from './events';

/** The plaza tower that carries the NON.agency branding (north-east corner). */
const HQ_ID = 'plaza-1';
const hq = buildings.find((building) => building.id === HQ_ID)!;

const BILLBOARD = { width: 7.4, height: 4, bottom: 3.6 } as const;
const ROOF_SIGN = { width: 15, height: 4.5, lift: 3.5 } as const;
/** Turns the rooftop sign a little towards the spawn point. */
const ROOF_SIGN_TURN = -0.35;

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

/** Freestanding pylon billboard in the plaza corner, readable from the spawn point. */
function Billboard() {
  const centerY = BILLBOARD.bottom + BILLBOARD.height / 2;
  return (
    <group
      position={[BRAND_BILLBOARD.x, 0, BRAND_BILLBOARD.z]}
      rotation-y={BRAND_BILLBOARD.rotationY}
      onClick={blockTap}
    >
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * BRAND_BILLBOARD.legOffset, BILLBOARD.bottom / 2, 0]}>
          <boxGeometry args={[0.35, BILLBOARD.bottom, 0.35]} />
          <meshStandardMaterial color="#1c1830" metalness={0.8} roughness={0.4} />
        </mesh>
      ))}
      <group position-y={centerY}>
        <mesh>
          <boxGeometry args={[BILLBOARD.width, BILLBOARD.height, 0.3]} />
          <meshStandardMaterial color="#07060f" metalness={0.6} roughness={0.4} />
        </mesh>
        {/* Both faces carry the brand. */}
        {[0, Math.PI].map((rotation) => (
          <group key={rotation} rotation-y={rotation}>
            <group position-z={0.2}>
              <Frame width={BILLBOARD.width} height={BILLBOARD.height} color={ACCENTS.magenta} />
              <group position-y={0.35}>
                <BrandLogo width={BILLBOARD.width * 0.72} color="#ffffff" />
              </group>
              <Text
                font={FONTS.display}
                position-y={-1.3}
                fontSize={0.3}
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
      <pointLight position={[0, centerY, 3]} color={ACCENTS.magenta} intensity={30} distance={12} />
    </group>
  );
}

/** Classic rooftop sign on a steel frame. */
function RoofSign() {
  const top = hq.height;
  const legHeight = ROOF_SIGN.lift;

  return (
    <group position={[hq.x, top, hq.z + hq.depth / 2 - 3]} rotation-y={ROOF_SIGN_TURN}>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[(side * ROOF_SIGN.width) / 2.6, legHeight / 2, 0]}>
          <boxGeometry args={[0.25, legHeight, 0.25]} />
          <meshStandardMaterial color="#1c1830" metalness={0.8} roughness={0.4} />
        </mesh>
      ))}
      <mesh position-y={legHeight}>
        <boxGeometry args={[ROOF_SIGN.width * 0.85, 0.2, 0.2]} />
        <meshStandardMaterial color="#1c1830" metalness={0.8} roughness={0.4} />
      </mesh>
      <group position-y={legHeight + ROOF_SIGN.height / 2}>
        <BrandLogo width={ROOF_SIGN.width} color={ACCENTS.cyan} glow={3} />
      </group>
    </group>
  );
}

export function NonAgencyHQ() {
  return (
    <group>
      <Billboard />
      <RoofSign />
    </group>
  );
}
