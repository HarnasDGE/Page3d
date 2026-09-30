import { Vector3 } from 'three';
import { create } from 'zustand';
import { player } from '@/scene/player/playerState';
import { useGameStore } from '@/scene/store/gameStore';
import { useToastStore } from '@/scene/store/toastStore';
import { computeThrow, getForward, getHandPosition } from './carry';
import { HOOP_AUTO_AIM_RANGE, INITIAL_CANS, MAX_CANS, nearestHoop } from './propLayout';

type Vec3 = [number, number, number];

export interface CanState {
  id: string;
  /** Spawn state of the current rigid body; bumping `generation` respawns it. */
  position: Vec3;
  velocity: Vec3;
  generation: number;
  variant: number;
}

export type Minigame = 'wiring' | null;

interface PropsState {
  cans: CanState[];
  heldCanId: string | null;
  spawnCan: (position: Vec3, velocity?: Vec3) => void;
  /** Remember where a can came to rest (street unmounts when entering a building). */
  saveCan: (id: string, position: Vec3) => void;
  pickUp: (id: string) => void;
  throwHeld: (target: Vector3) => void;
  /** Throw without aiming (touch button / F key): at a nearby hoop, else straight ahead. */
  throwAuto: () => void;
  dropHeld: () => void;

  binGeneration: number;
  binKickedAt: number | null;
  markBinKicked: () => void;
  resetBin: () => void;

  isPowerFixed: boolean;
  setPowerFixed: () => void;
  minigame: Minigame;
  setMinigame: (minigame: Minigame) => void;
  /** Timestamp (ms) of the last electric shock; drives flash and camera shake. */
  shockAt: number;
  shock: () => void;

  /** Timestamp (ms) until which the energy drink speed boost lasts. */
  boostUntil: number;
  startBoost: (durationMs: number) => void;

  hoop: { score: number; streak: number; best: number };
  /** Last throw, so a throw without a basket can break the streak. */
  lastThrowAt: number;
  isShotPending: boolean;
  scoreBasket: () => void;
  missBasket: () => void;
}

const hand = new Vector3();
const target = new Vector3();
const velocity = new Vector3();
const forward = new Vector3();
const autoTarget = new Vector3();
/** Distance of a plain forward throw. */
const FORWARD_THROW_DISTANCE = 7;

let nextCanId = INITIAL_CANS.length;

const maxCans = () => MAX_CANS[useGameStore.getState().quality];

export const usePropsStore = create<PropsState>((set, get) => ({
  cans: INITIAL_CANS.map(([x, z], i) => ({
    id: `can-${i}`,
    position: [x, 0.3, z],
    velocity: [0, 0, 0],
    generation: 0,
    variant: i % 3,
  })),
  heldCanId: null,

  spawnCan: (position, spawnVelocity = [0, 0, 0]) => {
    const { cans, heldCanId } = get();
    const id = `can-${nextCanId++}`;
    let next = [...cans, { id, position, velocity: spawnVelocity, generation: 0, variant: nextCanId % 3 }];
    // Drop the oldest loose cans once over budget.
    while (next.length > maxCans()) {
      const oldest = next.find((can) => can.id !== heldCanId);
      if (!oldest) break;
      next = next.filter((can) => can !== oldest);
    }
    set({ cans: next });
  },

  saveCan: (id, position) =>
    set({ cans: get().cans.map((can) => (can.id === id ? { ...can, position, velocity: [0, 0, 0] } : can)) }),

  pickUp: (id) => {
    if (get().heldCanId) return;
    set({ heldCanId: id });
  },

  throwHeld: (point) => {
    const { heldCanId, cans } = get();
    if (!heldCanId) return;

    // Face the target first so the can leaves from the correct hand position.
    player.heading = Math.atan2(point.x - player.position.x, point.z - player.position.z);
    getHandPosition(hand);
    computeThrow(hand, point, target, velocity);

    set({
      lastThrowAt: Date.now(),
      isShotPending: true,
      heldCanId: null,
      cans: cans.map((can) =>
        can.id === heldCanId
          ? { ...can, position: hand.toArray(), velocity: velocity.toArray(), generation: can.generation + 1 }
          : can,
      ),
    });
    useToastStore.getState().unlock('first-throw');
  },

  throwAuto: () => {
    if (!get().heldCanId) return;
    const { x, z } = player.position;
    const { hoop, distance } = nearestHoop(x, z);
    if (distance < HOOP_AUTO_AIM_RANGE) {
      autoTarget.set(hoop.rim.x, 0, hoop.rim.z);
    } else {
      getForward(forward);
      autoTarget.set(x + forward.x * FORWARD_THROW_DISTANCE, 0, z + forward.z * FORWARD_THROW_DISTANCE);
    }
    get().throwHeld(autoTarget);
  },

  dropHeld: () => {
    const { heldCanId, cans } = get();
    if (!heldCanId) return;
    getHandPosition(hand);
    getForward(forward);
    set({
      heldCanId: null,
      cans: cans.map((can) =>
        can.id === heldCanId
          ? {
              ...can,
              position: hand.toArray(),
              velocity: [forward.x * 1.5, 0.5, forward.z * 1.5],
              generation: can.generation + 1,
            }
          : can,
      ),
    });
  },

  binGeneration: 0,
  binKickedAt: null,
  markBinKicked: () => set({ binKickedAt: Date.now() }),
  resetBin: () => set({ binGeneration: get().binGeneration + 1, binKickedAt: null }),

  isPowerFixed: false,
  setPowerFixed: () => set({ isPowerFixed: true }),
  minigame: null,
  setMinigame: (minigame) => set({ minigame }),
  shockAt: 0,
  shock: () => set({ shockAt: Date.now() }),

  boostUntil: 0,
  startBoost: (durationMs) => set({ boostUntil: Date.now() + durationMs }),

  hoop: { score: 0, streak: 0, best: 0 },
  lastThrowAt: 0,
  isShotPending: false,
  scoreBasket: () => {
    const { score, streak, best } = get().hoop;
    const next = { score: score + 1, streak: streak + 1, best: Math.max(best, streak + 1) };
    set({ hoop: next, isShotPending: false });
    const toasts = useToastStore.getState();
    toasts.push(next.streak > 1 ? `Swish! ${next.streak} in a row` : 'Swish!');
    if (next.streak >= 3) toasts.unlock('hot-hand');
  },
  missBasket: () => set({ hoop: { ...get().hoop, streak: 0 }, isShotPending: false }),
}));
