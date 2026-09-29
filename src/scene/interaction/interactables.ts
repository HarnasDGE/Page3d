import { Vector3 } from 'three';
import { setMoveTarget } from '@/scene/controls/input';

/**
 * Something the player can use when standing close enough: a venue door,
 * the exit door of a room, later terminals and kiosks.
 */
export interface Interactable {
  id: string;
  /** Prompt text, e.g. "Enter DEV STUDIO". */
  label: string;
  /** Where the player stands to use it. */
  spot: { x: number; z: number };
  radius: number;
  activate: () => void;
  /** Temporarily hide it (e.g. can pick-ups while already holding one). */
  isEnabled?: () => boolean;
}

const registry = new Map<string, Interactable>();
/** Interactable to trigger automatically once the player walks up to it. */
let pendingId: string | null = null;

export function registerInteractable(interactable: Interactable) {
  registry.set(interactable.id, interactable);
  return () => {
    if (registry.get(interactable.id) === interactable) registry.delete(interactable.id);
  };
}

export function getInteractable(id: string | null) {
  return id ? (registry.get(id) ?? null) : null;
}

export function findNearestInteractable(x: number, z: number): Interactable | null {
  let nearest: Interactable | null = null;
  let nearestDistSq = Infinity;
  for (const item of registry.values()) {
    if (item.isEnabled && !item.isEnabled()) continue;
    const distSq = (item.spot.x - x) ** 2 + (item.spot.z - z) ** 2;
    if (distSq <= item.radius ** 2 && distSq < nearestDistSq) {
      nearest = item;
      nearestDistSq = distSq;
    }
  }
  return nearest;
}

/** Tap / click on an interactable: use it if close, otherwise walk there first. */
export function requestInteraction(id: string, nearbyId: string | null) {
  const item = registry.get(id);
  if (!item || (item.isEnabled && !item.isEnabled())) return;
  if (nearbyId === id) {
    pendingId = null;
    item.activate();
    return;
  }
  pendingId = id;
  setMoveTarget(new Vector3(item.spot.x, 0, item.spot.z));
}

export function takePendingInteraction(nearbyId: string | null) {
  if (!pendingId || pendingId !== nearbyId) return null;
  const item = registry.get(pendingId) ?? null;
  pendingId = null;
  return item;
}

export function cancelPendingInteraction() {
  pendingId = null;
}
