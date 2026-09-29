import { clearMoveTarget, resetInput } from '@/scene/controls/input';
import { ROOM_SPAWN, roomWorld } from '@/scene/interiors/roomLayout';
import { ROOM_CAMERA, STREET_CAMERA, teleportPlayer } from '@/scene/player/playerState';
import { useGameStore, type Location } from '@/scene/store/gameStore';
import { buildings } from '@/scene/world/cityLayout';
import { cityWorld, setCollisionWorld } from '@/scene/world/collision';
import { cancelPendingInteraction } from './interactables';

/** Must match the fade duration in FadeOverlay. */
export const FADE_MS = 350;
/** Extra time on black so the new scene gets a first frame before revealing it. */
const REVEAL_DELAY_MS = 120;
/** How far in front of a door the player appears when leaving a building. */
const STREET_EXIT_DISTANCE = 4.2;

function travel(location: Location, placePlayer: () => void) {
  const { isFading, setFading, setLocation } = useGameStore.getState();
  if (isFading) return;

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
  travel({ kind: 'interior', buildingId }, () => {
    setCollisionWorld(roomWorld);
    teleportPlayer({ ...ROOM_SPAWN, cameraYaw: 0, camera: ROOM_CAMERA });
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
