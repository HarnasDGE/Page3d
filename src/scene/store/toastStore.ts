import { create } from 'zustand';

export type AchievementId = 'first-throw' | 'vandal' | 'electrician' | 'sugar-rush' | 'hot-hand';

const ACHIEVEMENTS: Record<AchievementId, string> = {
  'first-throw': 'Litterbug · first can thrown',
  vandal: 'Vandal · kicked the trash bin',
  electrician: 'Electrician · power restored',
  'sugar-rush': 'Sugar rush · energy drink',
  'hot-hand': 'Hot hand · 3 baskets in a row',
};

const STORAGE_KEY = 'neon-district:achievements';
const TOAST_MS = 3200;

export interface Toast {
  id: number;
  text: string;
  kind: 'info' | 'achievement' | 'danger';
}

interface ToastState {
  toasts: Toast[];
  unlocked: AchievementId[];
  push: (text: string, kind?: Toast['kind']) => void;
  unlock: (id: AchievementId) => void;
}

function loadUnlocked(): AchievementId[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
  } catch {
    return [];
  }
}

let nextId = 1;

/** Short HUD notifications plus achievements remembered in this browser. */
export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  unlocked: typeof window === 'undefined' ? [] : loadUnlocked(),
  push: (text, kind = 'info') => {
    const toast = { id: nextId++, text, kind };
    set({ toasts: [...get().toasts.slice(-2), toast] });
    window.setTimeout(
      () => set({ toasts: get().toasts.filter((item) => item.id !== toast.id) }),
      TOAST_MS,
    );
  },
  unlock: (id) => {
    const { unlocked, push } = get();
    if (unlocked.includes(id)) return;
    const next = [...unlocked, id];
    set({ unlocked: next });
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Private mode / blocked storage: the achievement still shows once.
    }
    push(`Achievement unlocked: ${ACHIEVEMENTS[id]}`, 'achievement');
  },
}));
