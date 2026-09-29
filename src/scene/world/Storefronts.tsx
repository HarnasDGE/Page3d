import { Text } from '@react-three/drei';
import { FONTS } from '@/scene/fonts';
import { neon } from '@/scene/materials/neon';
import { useGameStore } from '@/scene/store/gameStore';
import { buildings, type Building } from './cityLayout';
import { blockTap } from './events';
import { venueByBuilding, type Venue } from './venues';

const DOOR_WIDTH = 2.4;
const DOOR_HEIGHT = 3.2;
const SIGN_Y = 4.6;
/** Distance the storefront sits in front of the facade to avoid z-fighting. */
const FACADE_OFFSET = 0.04;

const DECOR_SIGNS = ['NOODLES', 'HOTEL', '24/7', 'ARCADE', 'RAMEN', 'CYBER', 'DATA', 'SUSHI'];

/** Rotation that turns a group's +Z towards the building facing vector. */
const facingRotation = (building: Building) => Math.atan2(building.facing.x, building.facing.z);

function Storefront({ building, venue }: { building: Building; venue: Venue }) {
  const quality = useGameStore((state) => state.quality);
  const glow = neon(venue.accent, 2.6);
  const frame = neon(venue.accent, 1.6);

  return (
    <group
      position={[building.door.x, 0, building.door.z]}
      rotation-y={facingRotation(building)}
      onClick={blockTap}
    >
      <group position-z={FACADE_OFFSET}>
        {/* Door */}
        <mesh position-y={DOOR_HEIGHT / 2}>
          <planeGeometry args={[DOOR_WIDTH, DOOR_HEIGHT]} />
          <meshStandardMaterial color="#05040b" metalness={0.9} roughness={0.2} />
        </mesh>
        {[-1, 1].map((side) => (
          <mesh key={side} position={[(side * DOOR_WIDTH) / 2, DOOR_HEIGHT / 2, 0.02]}>
            <boxGeometry args={[0.08, DOOR_HEIGHT, 0.04]} />
            <meshBasicMaterial color={frame} toneMapped={false} />
          </mesh>
        ))}
        <mesh position={[0, DOOR_HEIGHT, 0.02]}>
          <boxGeometry args={[DOOR_WIDTH + 0.08, 0.08, 0.04]} />
          <meshBasicMaterial color={frame} toneMapped={false} />
        </mesh>

        {/* Sign above the door */}
        <mesh position={[0, SIGN_Y, 0.1]}>
          <boxGeometry args={[Math.max(venue.sign.length * 0.62 + 1.2, 5), 1.5, 0.2]} />
          <meshStandardMaterial color="#0b0916" metalness={0.6} roughness={0.4} />
        </mesh>
        <Text
          font={FONTS.display}
          position={[0, SIGN_Y, 0.22]}
          fontSize={0.75}
          letterSpacing={0.08}
          anchorX="center"
          anchorY="middle"
        >
          {venue.sign}
          <meshBasicMaterial color={glow} toneMapped={false} />
        </Text>
      </group>

      {quality === 'high' && (
        <pointLight position={[0, 3.2, 2]} color={venue.accent} intensity={18} distance={10} />
      )}
    </group>
  );
}

/** Length of the main facade (the side the door is on). */
const facadeLength = (building: Building) =>
  building.facing.x !== 0 ? building.depth : building.width;

/** Vertical neon blade sign sticking out of a decorative building. */
function BladeSign({ building, word }: { building: Building; word: string }) {
  const color = building.accent;
  const height = word.length * 0.9 + 0.8;
  return (
    <group
      position={[building.door.x, 7 + height / 2, building.door.z]}
      rotation-y={facingRotation(building)}
    >
      <group position={[facadeLength(building) / 2 - 2, 0, 0.8]} rotation-y={Math.PI / 2}>
        <mesh>
          <boxGeometry args={[1.3, height, 0.15]} />
          <meshStandardMaterial color="#0b0916" metalness={0.6} roughness={0.4} />
        </mesh>
        {[1, -1].map((side) => (
          <Text
            key={side}
            font={FONTS.display}
            position-z={side * 0.09}
            rotation-y={side > 0 ? 0 : Math.PI}
            fontSize={0.7}
            lineHeight={1.25}
            anchorX="center"
            anchorY="middle"
            textAlign="center"
          >
            {word.split('').join('\n')}
            <meshBasicMaterial color={neon(color, 2.4)} toneMapped={false} />
          </Text>
        ))}
      </group>
    </group>
  );
}

export function Storefronts() {
  const decorative = buildings.filter(
    (building) => building.street !== 'plaza' && !venueByBuilding.has(building.id),
  );

  return (
    <group>
      {buildings.map((building) => {
        const venue = venueByBuilding.get(building.id);
        return venue ? <Storefront key={building.id} building={building} venue={venue} /> : null;
      })}
      {decorative
        .filter((_, i) => i % 2 === 0)
        .map((building, i) => (
          <BladeSign
            key={building.id}
            building={building}
            word={DECOR_SIGNS[i % DECOR_SIGNS.length]}
          />
        ))}
    </group>
  );
}
