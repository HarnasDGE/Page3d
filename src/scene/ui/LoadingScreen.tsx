import { useGameStore } from '@/scene/store/gameStore';

export function LoadingScreen() {
  const isReady = useGameStore((state) => state.isReady);

  return (
    <div
      aria-hidden={isReady}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-night transition-opacity duration-700 ${
        isReady ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
    >
      <div className="size-12 animate-spin rounded-full border-2 border-neon-cyan/20 border-t-neon-cyan" />
      <p className="font-display text-sm tracking-[0.3em] text-neon-cyan">BOOTING DISTRICT</p>
    </div>
  );
}
