import { useToastStore, type Toast } from '@/scene/store/toastStore';

const STYLES: Record<Toast['kind'], string> = {
  info: 'border-neon-cyan/60 text-white',
  achievement: 'border-neon-amber text-neon-amber shadow-[0_0_24px_rgba(255,184,0,0.35)]',
  danger: 'border-neon-magenta text-neon-magenta shadow-[0_0_24px_rgba(255,43,214,0.35)]',
};

/** Short notifications at the top of the screen (achievements, events). */
export function Toasts() {
  const toasts = useToastStore((state) => state.toasts);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-16 z-30 flex flex-col items-center gap-2 px-4 sm:top-6"
    >
      {toasts.map((toast) => (
        <p
          key={toast.id}
          className={`toast-in rounded-lg border bg-night/80 px-4 py-2 text-center font-display text-xs tracking-widest uppercase backdrop-blur-md ${STYLES[toast.kind]}`}
        >
          {toast.text}
        </p>
      ))}
    </div>
  );
}
