import { usePropsStore } from '@/scene/props/propsStore';

/** Instructions + exit for the wiring puzzle, and the white flash of a shock. */
export function MinigameOverlay() {
  const minigame = usePropsStore((state) => state.minigame);
  const shockAt = usePropsStore((state) => state.shockAt);
  const setMinigame = usePropsStore((state) => state.setMinigame);

  return (
    <>
      {shockAt > 0 && (
        <div key={shockAt} aria-hidden className="shock-flash pointer-events-none fixed inset-0 z-40" />
      )}
      {minigame === 'wiring' && (
        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-20 flex justify-center px-4">
          <div className="pointer-events-auto max-w-md rounded-xl border border-neon-amber/60 bg-night/80 px-5 py-4 text-center shadow-[0_0_24px_rgba(255,184,0,0.3)] backdrop-blur-md">
            <p className="font-display text-xs tracking-[0.25em] text-neon-amber uppercase">Repair the power box</p>
            <p className="mt-2 text-base text-white/85">
              Connect the cable whose tag matches the <strong className="text-neon-amber">LIVE</strong> symbol.
              <span className="pointer-coarse:hidden"> Click a cable or press 1–4.</span>
              <span className="hidden pointer-coarse:inline"> Tap a cable.</span>
            </p>
            <button
              type="button"
              onClick={() => setMinigame(null)}
              className="mt-3 rounded-md border border-white/30 px-4 py-1.5 font-display text-xs tracking-widest text-white/80 uppercase transition hover:border-neon-amber hover:text-neon-amber"
            >
              <span className="pointer-coarse:hidden">Esc · </span>Step back
            </button>
          </div>
        </div>
      )}
    </>
  );
}
