import { useEffect, useRef, useState } from 'react';
import { chargePower } from '@/scene/props/carry';
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

/** Throw power bar, animated every frame while the throw is charging. */
function PowerMeter({ startedAt }: { startedAt: number }) {
  const fill = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    const tick = () => {
      if (fill.current) fill.current.style.width = `${chargePower(Date.now() - startedAt) * 100}%`;
      frame = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(frame);
  }, [startedAt]);

  return (
    <div
      role="presentation"
      className="h-3 w-56 overflow-hidden rounded-full border border-neon-amber/70 bg-night/80 backdrop-blur-md"
    >
      <div ref={fill} className="h-full rounded-full bg-gradient-to-r from-neon-cyan via-neon-amber to-neon-magenta" />
    </div>
  );
}

/** Contextual controls: hold-to-throw with a power meter, drop, and the boost timer. */
export function StatusBar() {
  const isHolding = usePropsStore((state) => state.heldCanId !== null);
  const chargeStartedAt = usePropsStore((state) => state.chargeStartedAt);
  const { startCharge, releaseCharge, dropHeld } = usePropsStore.getState();
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
      {chargeStartedAt !== null && <PowerMeter startedAt={chargeStartedAt} />}
      {isHolding && (
        <div className="pointer-events-auto flex items-center gap-3 rounded-lg border border-neon-amber/60 bg-night/70 px-3 py-2 text-sm text-white/85 backdrop-blur-md">
          <button
            type="button"
            // Hold to charge, release to throw (pointer capture keeps the release on the button).
            onPointerDown={(event) => {
              startCharge();
              try {
                event.currentTarget.setPointerCapture(event.pointerId);
              } catch {
                // Capture is a nicety; the charge works without it.
              }
            }}
            onPointerUp={releaseCharge}
            onPointerCancel={releaseCharge}
            onContextMenu={(event) => event.preventDefault()}
            className="touch-none rounded border border-neon-amber bg-neon-amber/20 px-5 py-2 font-display text-xs tracking-widest text-neon-amber uppercase select-none active:bg-neon-amber/40"
          >
            Hold to throw
          </button>
          <button
            type="button"
            onClick={dropHeld}
            className="rounded border border-white/30 px-4 py-2 font-display text-xs tracking-widest uppercase"
          >
            Drop
          </button>
          <span className="hidden text-xs text-white/60 pointer-fine:inline">
            or hold <kbd className="font-display text-neon-amber">F</kbd> · <kbd className="font-display text-neon-amber">Q</kbd>
          </span>
        </div>
      )}
    </div>
  );
}
