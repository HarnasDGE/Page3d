import { useEffect, useRef, type ReactNode } from 'react';
import { useGameStore } from '@/scene/store/gameStore';

interface PanelFrameProps {
  title: string;
  eyebrow?: string;
  accent: string;
  children: ReactNode;
}

/** Holographic modal used for long-form content (post reader, contact form). */
export function PanelFrame({ title, eyebrow, accent, children }: PanelFrameProps) {
  const closePanel = useGameStore((state) => state.closePanel);
  const dialog = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    dialog.current?.focus();
    return () => previous?.focus();
  }, []);

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center p-3 sm:p-6">
      <button
        type="button"
        aria-label="Close panel"
        className="absolute inset-0 cursor-default bg-night/60 backdrop-blur-sm"
        onClick={closePanel}
      />
      <div
        ref={dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="panel-title"
        tabIndex={-1}
        className="relative flex max-h-[88dvh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border bg-night-soft/90 shadow-2xl outline-none"
        style={{ borderColor: accent, boxShadow: `0 0 40px ${accent}44` }}
      >
        <header className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-4 sm:px-7">
          <div>
            {eyebrow && (
              <p className="font-display text-[0.65rem] tracking-[0.25em] uppercase" style={{ color: accent }}>
                {eyebrow}
              </p>
            )}
            <h2 id="panel-title" className="mt-1 font-display text-lg leading-snug font-bold sm:text-xl">
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={closePanel}
            className="shrink-0 rounded-md border border-white/25 px-3 py-1.5 font-display text-xs tracking-widest text-white/80 uppercase transition hover:border-neon-cyan hover:text-neon-cyan focus-visible:outline-2 focus-visible:outline-neon-cyan"
          >
            <span className="pointer-coarse:hidden">Esc · </span>Close
          </button>
        </header>
        <div className="overflow-y-auto overscroll-contain px-5 py-5 sm:px-7">{children}</div>
      </div>
    </div>
  );
}
