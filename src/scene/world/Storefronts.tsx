import { neon } from '@/scene/materials/neon';
import { requestInteraction } from '@/scene/interaction/interactables';
import { enterVenue } from '@/scene/interaction/travel';
import { useInteractable } from '@/scene/interaction/useInteractable';
import { useGameStore } from '@/scene/store/gameStore';
import { buildings, facadeLength, facingRotation, type Building } from './cityLayout';
import { onTap } from './events';
import { BladeSign } from './signs/BladeSign';
import { WallSign } from './signs/WallSign';
import { venueByBuilding, type Venue } from './venues';

const DOOR_WIDTH = 2.4;
const DOOR_HEIGHT = 3.2;
const SIGN_Y = 4.6;
/** Distance the storefront sits in front of the facade to avoid z-fighting. */
const FACADE_OFFSET = 0.04;
/** Where the player stands to enter, measured out from the door. */
const ENTRY_DISTANCE = 1.6;
const ENTRY_RADIUS = 2.2;

const DECOR_SIGNS = ['NOODLES', 'HOTEL', '24/7', 'ARCADE', 'RAMEN', 'CYBER', 'DATA', 'SUSHI'];


function Storefront({ building, venue }: { building: Building; venue: Venue }) {
  const id = `venue:${building.id}`;
  const quality = useGameStore((state) => state.quality);
  const isNearby = useGameStore((state) => state.nearbyId === id);
  const frame = neon(venue.accent, isNearby ? 3.2 : 1.6);

  useInteractable({
    id,
    label: `Enter ${venue.sign}`,
    spot: {
      x: building.door.x + building.facing.x * ENTRY_DISTANCE,
      z: building.door.z + building.facing.z * ENTRY_DISTANCE,
    },
    radius: ENTRY_RADIUS,
    activate: () => enterVenue(building.id),
  });

  return (
    <group
      position={[building.door.x, 0, building.door.z]}
      rotation-y={facingRotation(building)}
      onClick={onTap(() => requestInteraction(id, useGameStore.getState().nearbyId))}
    >
      <group position-z={FACADE_OFFSET}>
        {/* Door */}
        <mesh position-y={DOOR_HEIGHT / 2}>
          <planeGeometry args={[DOOR_WIDTH, DOOR_HEIGHT]} />
          <meshStandardMaterial
            color="#05040b"
            emissive={venue.accent}
            emissiveIntensity={isNearby ? 0.35 : 0}
            metalness={0.9}
            roughness={0.2}
          />
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

        {/* 3D sign projecting from the wall above the door */}
        <group position-y={SIGN_Y}>
          <WallSign text={venue.sign} accent={venue.accent} />
        </group>
      </group>

      {quality === 'high' && (
        <pointLight position={[0, 3.2, 2]} color={venue.accent} intensity={18} distance={10} />
      )}
    </group>
  );
}

/** Height of the centre of the vertical blade signs on decorative buildings. */
const BLADE_Y = 9.5;

/** Vertical 3D blade sign sticking out of a decorative building. */
function DecorBladeSign({ building, word }: { building: Building; word: string }) {
  return (
    <group position={[building.door.x, BLADE_Y, building.door.z]} rotation-y={facingRotation(building)}>
      <group position-x={facadeLength(building) / 2 - 2}>
        <BladeSign word={word} accent={building.accent} />
      </group>
    </group>
  );
}

export function Storefronts() {
  const decorative = buildings.filter(
    (building, index) =>
      building.street !== 'plaza' &&
      !venueByBuilding.has(building.id) &&
      (building.street !== 'ring' || index % 2 === 1),
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
          <DecorBladeSign
            key={building.id}
            building={building}
            word={DECOR_SIGNS[i % DECOR_SIGNS.length]}
          />
        ))}
    </group>
  );
}
