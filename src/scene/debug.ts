import { enterVenue, exitToStreet } from './interaction/travel';
import { cameraOrbit, player } from './player/playerState';
import { canPositions } from './props/components/Cans';
import { usePropsStore } from './props/propsStore';
import { useGameStore } from './store/gameStore';
import { useToastStore } from './store/toastStore';

/** Dev-only handle for debugging and automated browser checks. Never shipped. */
export function exposeDebugHandle() {
  Object.assign(window, {
    __neon: { player, cameraOrbit, enterVenue, exitToStreet, store: useGameStore, props: usePropsStore, canPositions, toasts: useToastStore },
  });
}
