import { useEffect, useRef } from 'react';
import { registerInteractable, type Interactable } from './interactables';

/** Registers an interactable while the calling component is mounted. */
export function useInteractable(interactable: Interactable) {
  // Keep the latest callback without re-registering on every render.
  const latest = useRef(interactable);
  latest.current = interactable;

  const { id, label, radius } = interactable;
  const { x, z } = interactable.spot;

  useEffect(
    () =>
      registerInteractable({
        id,
        label,
        radius,
        spot: { x, z },
        activate: () => latest.current.activate(),
      }),
    [id, label, radius, x, z],
  );
}
