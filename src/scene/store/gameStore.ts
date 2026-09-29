import { create } from 'zustand';

interface GameState {
  isReady: boolean;
  setReady: (isReady: boolean) => void;
}

export const useGameStore = create<GameState>((set) => ({
  isReady: false,
  setReady: (isReady) => set({ isReady }),
}));
