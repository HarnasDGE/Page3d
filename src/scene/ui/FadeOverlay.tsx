import { FADE_MS } from '@/scene/interaction/travel';
import { useGameStore } from '@/scene/store/gameStore';

/** Black curtain hiding the scene swap when entering or leaving a building. */
export function FadeOverlay() {
  const isFading = useGameStore((state) => state.isFading);

  return (
    <div
      aria-hidden
      className={`pointer-events-none fixed inset-0 z-40 bg-night transition-opacity ease-in-out ${
        isFading ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ transitionDuration: `${FADE_MS}ms` }}
    />
  );
}
