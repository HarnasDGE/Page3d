import { enterVenue, exitToStreet } from './interaction/travel';
import { cameraOrbit, player } from './player/playerState';
import { useGameStore } from './store/gameStore';

/** Dev-only handle for debugging and automated browser checks. Never shipped. */
export function exposeDebugHandle() {
  Object.assign(window, {
    __neon: { player, cameraOrbit, enterVenue, exitToStreet, store: useGameStore },
  });
}
