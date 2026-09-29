import { useEffect } from 'react';
import { getInteractable } from '@/scene/interaction/interactables';
import { exitToStreet } from '@/scene/interaction/travel';
import { useGameStore } from '@/scene/store/gameStore';
import { isTypingTarget } from './useKeyboardControls';

/** E / Enter uses the nearby interactable, Escape leaves the current building. */
export function useActionKeys() {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat || isTypingTarget(event.target)) return;

      if (event.code === 'KeyE' || event.code === 'Enter') {
        const item = getInteractable(useGameStore.getState().nearbyId);
        if (!item) return;
        event.preventDefault();
        item.activate();
      } else if (event.code === 'Escape') {
        exitToStreet();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);
}
