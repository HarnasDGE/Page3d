import { exitToStreet } from '@/scene/interaction/travel';
import { useGameStore } from '@/scene/store/gameStore';
import { venueByBuilding } from '@/scene/world/venues';

/** Top-right indicator of where the player is, with a way back out. */
export function LocationBar() {
  const location = useGameStore((state) => state.location);
  const venue = location.kind === 'interior' ? venueByBuilding.get(location.buildingId) : undefined;

  return (
    <div className="fixed top-4 right-4 z-20 flex items-center gap-3 sm:top-6 sm:right-6">
      <p
        className="hidden font-display text-xs tracking-[0.25em] uppercase sm:block"
        style={{ color: venue?.accent ?? 'var(--color-neon-cyan)' }}
      >
        {venue ? venue.sign : 'Neon District'}
        {location.kind === 'interior' && location.floor > 0 && ` · PAGE ${location.floor + 1}`}
      </p>
      {venue && (
        <button
          type="button"
          onClick={exitToStreet}
          className="rounded-md border border-white/30 bg-night/60 px-3 py-1.5 font-display text-xs tracking-widest text-white/80 uppercase backdrop-blur-md transition hover:border-neon-cyan hover:text-neon-cyan focus-visible:outline-2 focus-visible:outline-neon-cyan"
        >
          <span className="pointer-coarse:hidden">Esc · </span>Exit
        </button>
      )}
    </div>
  );
}
