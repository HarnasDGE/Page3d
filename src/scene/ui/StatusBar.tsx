import { useEffect, useState } from 'react';
import { usePropsStore } from '@/scene/props/propsStore';
import { useGameStore } from '@/scene/store/gameStore';

/** Seconds left of the energy drink boost, ticking while it lasts. */
function useBoostSecondsLeft() {
  const boostUntil = usePropsStore((state) => state.boostUntil);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (boostUntil <= Date.now()) return;
    const timer = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(timer);
  }, [boostUntil]);

  return Math.max(0, Math.ceil((boostUntil - now) / 1000));
}

/** Contextual hints: what to do with a held can, and the boost timer. */
export function StatusBar() {
  const isHolding = usePropsStore((state) => state.heldCanId !== null);
  const dropHeld = usePropsStore((state) => state.dropHeld);
  const throwAuto = usePropsStore((state) => state.throwAuto);
  const hasOverlay = useGameStore((state) => state.panel !== null || state.isFading);
  const boostSeconds = useBoostSecondsLeft();

  if (hasOverlay || (!isHolding && boostSeconds === 0)) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-40 z-20 flex flex-col items-center gap-2 px-4 sm:bottom-28">
      {boostSeconds > 0 && (
        <p className="rounded-full border border-neon-amber bg-night/70 px-4 py-1 font-display text-xs tracking-widest text-neon-amber uppercase backdrop-blur-md">
          Energy boost · {boostSeconds}s
        </p>
      )}
      {isHolding && (
        <div className="pointer-events-auto flex items-center gap-3 rounded-lg border border-neon-amber/60 bg-night/70 px-4 py-2 text-sm text-white/85 backdrop-blur-md">
          <span className="pointer-coarse:hidden">
            Click to throw · <kbd className="font-display text-neon-amber">F</kbd> shoot at hoop ·{' '}
            <kbd className="font-display text-neon-amber">Q</kbd> drop
          </span>
          {/* Touch: tap anywhere throws there; the button aims at the nearest hoop for you. */}
          <button
            type="button"
            onClick={throwAuto}
            className="hidden rounded border border-neon-amber bg-neon-amber/20 px-4 py-2 font-display text-xs tracking-widest text-neon-amber uppercase pointer-coarse:inline"
          >
            Throw
          </button>
          <button
            type="button"
            onClick={dropHeld}
            className="hidden rounded border border-white/30 px-4 py-2 font-display text-xs tracking-widest uppercase pointer-coarse:inline"
          >
            Drop
          </button>
        </div>
      )}
    </div>
  );
}
