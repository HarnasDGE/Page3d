import { useGameStore } from '@/scene/store/gameStore';
import { ContactPanel } from './ContactPanel';
import { PostReader } from './PostReader';

/** Renders whichever content panel is open, if any. */
export function PanelHost() {
  const panel = useGameStore((state) => state.panel);
  if (!panel) return null;

  switch (panel.kind) {
    case 'post':
      return <PostReader key={panel.slug} slug={panel.slug} />;
    case 'contact':
      return <ContactPanel key={panel.topic ?? ''} topic={panel.topic} />;
  }
}
