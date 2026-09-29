import { formatDate } from '@/lib/format';
import { useContentStore } from '@/scene/store/contentStore';
import { ACCENTS } from '@/scene/world/cityLayout';
import { PanelFrame } from './PanelFrame';

export function PostReader({ slug }: { slug: string }) {
  const post = useContentStore((state) => state.posts.find((p) => p.slug === slug));
  if (!post) return null;

  return (
    <PanelFrame
      title={post.title}
      eyebrow={`${formatDate(post.date)} · ${post.readingMinutes} min read`}
      accent={ACCENTS.amber}
    >
      {post.cover && (
        <img
          src={post.cover}
          alt=""
          width={800}
          height={450}
          className="mb-6 aspect-video w-full rounded-lg border border-neon-amber/30 object-cover"
        />
      )}
      <article className="prose-neon" dangerouslySetInnerHTML={{ __html: post.html }} />
      <p className="mt-6 flex flex-wrap gap-2">
        {post.tags.map((tag) => (
          <span key={tag} className="rounded border border-neon-amber/40 px-2 py-0.5 text-xs text-neon-amber">
            #{tag}
          </span>
        ))}
      </p>
    </PanelFrame>
  );
}
