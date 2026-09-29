import { create } from 'zustand';

export type Quality = 'high' | 'low';

export type Location = { kind: 'street' } | { kind: 'interior'; buildingId: string };

/** HTML overlay for long-form content that doesn't fit on a 3D panel. */
export type Panel = { kind: 'post'; slug: string } | { kind: 'contact'; topic?: string };

interface GameState {
  isReady: boolean;
  setReady: (isReady: boolean) => void;
  /** 'low' drops reflections, heavy post-processing and particle counts. */
  quality: Quality;
  setQuality: (quality: Quality) => void;
  location: Location;
  setLocation: (location: Location) => void;
  /** Screen is faded to black while the scene swaps. */
  isFading: boolean;
  setFading: (isFading: boolean) => void;
  /** Interactable the player currently stands next to. */
  nearbyId: string | null;
  setNearby: (nearbyId: string | null) => void;
  panel: Panel | null;
  openPanel: (panel: Panel) => void;
  closePanel: () => void;
  /** A message was sent; the tower plays its burst once the panel closes. */
  isSignalPending: boolean;
  setSignalPending: (isSignalPending: boolean) => void;
}

function detectQuality(): Quality {
  if (typeof window === 'undefined') return 'high';
  const isTouch = window.matchMedia('(pointer: coarse)').matches;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
  return isTouch || memory < 4 ? 'low' : 'high';
}

export const useGameStore = create<GameState>((set) => ({
  isReady: false,
  setReady: (isReady) => set({ isReady }),
  quality: detectQuality(),
  setQuality: (quality) => set({ quality }),
  location: { kind: 'street' },
  setLocation: (location) => set({ location, nearbyId: null, panel: null }),
  isFading: false,
  setFading: (isFading) => set({ isFading }),
  nearbyId: null,
  setNearby: (nearbyId) => set({ nearbyId }),
  panel: null,
  openPanel: (panel) => set({ panel }),
  closePanel: () => set({ panel: null }),
  isSignalPending: false,
  setSignalPending: (isSignalPending) => set({ isSignalPending }),
}));
