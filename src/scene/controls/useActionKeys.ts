import { useEffect } from 'react';
import { getInteractable } from '@/scene/interaction/interactables';
import { exitToStreet } from '@/scene/interaction/travel';
import { usePropsStore } from '@/scene/props/propsStore';
import { useGameStore } from '@/scene/store/gameStore';
import { isTypingTarget } from './useKeyboardControls';

/**
 * E / Enter uses the nearby interactable, Q drops a held item,
 * Escape closes a minigame or panel, or leaves the building.
 */
export function useActionKeys() {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return;
      const { panel, closePanel, nearbyId } = useGameStore.getState();

      const { minigame, setMinigame } = usePropsStore.getState();

      if (event.code === 'Escape') {
        if (minigame) setMinigame(null);
        else if (panel) closePanel();
        else exitToStreet();
        return;
      }

      if (panel || minigame || isTypingTarget(event.target)) return;

      if (event.code === 'KeyQ') {
        usePropsStore.getState().dropHeld();
      } else if (event.code === 'KeyE' || event.code === 'Enter') {
        const item = getInteractable(nearbyId);
        if (!item) return;
        event.preventDefault();
        item.activate();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);
}
