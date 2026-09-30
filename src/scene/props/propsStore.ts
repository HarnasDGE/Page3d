import { Vector3 } from 'three';
import { create } from 'zustand';
import { player } from '@/scene/player/playerState';
import { useGameStore } from '@/scene/store/gameStore';
import { useToastStore } from '@/scene/store/toastStore';
import { TRASH_BINS } from '@/scene/world/cityLayout';
import { chargedThrowPoint, chargePower, computeThrow, getForward, getHandPosition } from './carry';
import { INITIAL_CANS, MAX_CANS } from './propLayout';

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
  dropHeld: () => void;
  /** Hold-to-throw (Throw button / F): when charging started, null when idle. */
  chargeStartedAt: number | null;
  startCharge: () => void;
  /** Throws straight ahead with the power reached, or does nothing if not charging. */
  releaseCharge: () => void;

  /** Per trash bin: bumping the generation respawns it upright. */
  bins: Record<string, { generation: number; kickedAt: number | null }>;
  markBinKicked: (id: string) => void;
  resetBin: (id: string) => void;

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
const chargeTarget = new Vector3();

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

  dropHeld: () => {
    const { heldCanId, cans } = get();
    if (!heldCanId) return;
    set({ chargeStartedAt: null });
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

  chargeStartedAt: null,
  startCharge: () => {
    const { heldCanId, chargeStartedAt, minigame } = get();
    if (!heldCanId || chargeStartedAt !== null || minigame) return;
    set({ chargeStartedAt: Date.now() });
  },
  releaseCharge: () => {
    const { chargeStartedAt, heldCanId, throwHeld } = get();
    if (chargeStartedAt === null) return;
    set({ chargeStartedAt: null });
    if (!heldCanId) return;
    throwHeld(chargedThrowPoint(chargePower(Date.now() - chargeStartedAt), chargeTarget));
  },

  bins: Object.fromEntries(TRASH_BINS.map((bin) => [bin.id, { generation: 0, kickedAt: null }])),
  markBinKicked: (id) => {
    const bins = get().bins;
    set({ bins: { ...bins, [id]: { ...bins[id], kickedAt: Date.now() } } });
  },
  resetBin: (id) => {
    const bins = get().bins;
    set({ bins: { ...bins, [id]: { generation: bins[id].generation + 1, kickedAt: null } } });
  },

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
