import { getInteractable } from '@/scene/interaction/interactables';
import { usePropsStore } from '@/scene/props/propsStore';
import { useGameStore } from '@/scene/store/gameStore';

/** "Press E" prompt on desktop, tappable button on touch screens. */
export function InteractionPrompt() {
  const nearbyId = useGameStore((state) => state.nearbyId);
  const isFading = useGameStore((state) => state.isFading);
  const hasPanel = useGameStore((state) => state.panel !== null);
  const hasMinigame = usePropsStore((state) => state.minigame !== null);
  const item = getInteractable(nearbyId);

  if (!item || isFading || hasPanel || hasMinigame) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-20 flex justify-center px-4 sm:bottom-10">
      <button
        type="button"
        onClick={() => item.activate()}
        className="pointer-events-auto flex items-center gap-3 rounded-lg border border-neon-cyan/60 bg-night/70 px-5 py-3 font-display text-sm tracking-widest text-white uppercase shadow-[0_0_24px_rgba(0,240,255,0.35)] backdrop-blur-md transition hover:bg-neon-cyan/15 focus-visible:outline-2 focus-visible:outline-neon-cyan"
      >
        <kbd className="rounded border border-neon-cyan px-2 py-0.5 text-xs text-neon-cyan pointer-coarse:hidden">
          E
        </kbd>
        {item.label}
      </button>
    </div>
  );
}
