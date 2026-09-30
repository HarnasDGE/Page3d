import { clearMoveTarget, resetInput } from '@/scene/controls/input';
import { ROOM_CENTER_Z, ROOM_SPAWN, roomWorldFor, STAIRS } from '@/scene/interiors/roomLayout';
import { usePropsStore } from '@/scene/props/propsStore';
import { ROOM_CAMERA, STREET_CAMERA, teleportPlayer } from '@/scene/player/playerState';
import { useGameStore, type Location } from '@/scene/store/gameStore';
import { buildings } from '@/scene/world/cityLayout';
import { cityWorld, setCollisionWorld } from '@/scene/world/collision';
import { venueByBuilding } from '@/scene/world/venues';
import { cancelPendingInteraction } from './interactables';
import { floorStairs } from './readingRoom';

/** Must match the fade duration in FadeOverlay. */
export const FADE_MS = 350;
/** Extra time on black so the new scene gets a first frame before revealing it. */
const REVEAL_DELAY_MS = 120;
/** How far in front of a door the player appears when leaving a building. */
const STREET_EXIT_DISTANCE = 4.2;

function travel(location: Location, placePlayer: () => void) {
  const { isFading, setFading, setLocation } = useGameStore.getState();
  if (isFading) return;

  // Items can't be carried indoors; the can stays on the street.
  usePropsStore.getState().dropHeld();
  resetInput();
  clearMoveTarget();
  cancelPendingInteraction();
  setFading(true);

  window.setTimeout(() => {
    placePlayer();
    setLocation(location);
    window.setTimeout(() => setFading(false), REVEAL_DELAY_MS);
  }, FADE_MS);
}

export function enterVenue(buildingId: string) {
  const venue = venueByBuilding.get(buildingId);
  if (!venue) return;

  travel({ kind: 'interior', buildingId, floor: 0 }, () => {
    setCollisionWorld(roomWorldFor(venue.kind, venue.kind === 'blog' ? floorStairs(venue.slug, 0) : {}));
    teleportPlayer({ ...ROOM_SPAWN, cameraYaw: 0, camera: ROOM_CAMERA });
  });
}

/**
 * Takes the stairs in a reading room. Going up you come out of the stairwell
 * (the "down" stairs of the new floor); going down you arrive at the foot of
 * the stairs up.
 */
export function changeFloor(direction: 'up' | 'down') {
  const { location } = useGameStore.getState();
  if (location.kind !== 'interior') return;
  const venue = venueByBuilding.get(location.buildingId);
  if (!venue || venue.kind !== 'blog') return;

  const floor = location.floor + (direction === 'up' ? 1 : -1);
  const stairs = floorStairs(venue.slug, floor);
  if (floor < 0 || (direction === 'up' && !stairs.down)) return;

  const arrival = direction === 'up' ? STAIRS.down.spot : STAIRS.up.spot;
  // Face the middle of the room, camera behind the android.
  const heading = Math.atan2(-arrival.x, ROOM_CENTER_Z - arrival.z);

  travel({ ...location, floor }, () => {
    setCollisionWorld(roomWorldFor('blog', stairs));
    teleportPlayer({ ...arrival, heading, cameraYaw: heading + Math.PI, camera: ROOM_CAMERA });
  });
}

export function exitToStreet() {
  const { location } = useGameStore.getState();
  if (location.kind !== 'interior') return;
  const building = buildings.find((b) => b.id === location.buildingId);
  if (!building) return;

  const { door, facing } = building;
  const heading = Math.atan2(facing.x, facing.z);

  travel({ kind: 'street' }, () => {
    setCollisionWorld(cityWorld);
    teleportPlayer({
      x: door.x + facing.x * STREET_EXIT_DISTANCE,
      z: door.z + facing.z * STREET_EXIT_DISTANCE,
      heading,
      // Camera out on the street, slightly to the side, looking back at the door.
      cameraYaw: heading + 0.5,
      camera: STREET_CAMERA,
    });
  });
}
