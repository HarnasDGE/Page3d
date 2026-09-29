import { useEffect } from 'react';
import { getInteractable } from '@/scene/interaction/interactables';
import { exitToStreet } from '@/scene/interaction/travel';
import { useGameStore } from '@/scene/store/gameStore';
import { isTypingTarget } from './useKeyboardControls';

/** E / Enter uses the nearby interactable; Escape closes a panel or leaves the building. */
export function useActionKeys() {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return;
      const { panel, closePanel, nearbyId } = useGameStore.getState();

      if (event.code === 'Escape') {
        if (panel) closePanel();
        else exitToStreet();
        return;
      }

      if (panel || isTypingTarget(event.target)) return;

      if (event.code === 'KeyE' || event.code === 'Enter') {
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
