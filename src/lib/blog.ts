import { getCollection } from 'astro:content';
import { categoryBySlug } from '@/data/blogCategories';
import type { BlogPost } from '@/types/blog';

const WORDS_PER_MINUTE = 220;

/** Cover artwork by file name, resolved to hashed asset URLs by Vite. */
const covers = import.meta.glob<string>('/src/assets/blog/*.svg', {
  query: '?url',
  import: 'default',
  eager: true,
});

function coverUrl(name: string | undefined) {
  if (!name) return undefined;
  const url = covers[`/src/assets/blog/${name}.svg`];
  if (!url) throw new Error(`Blog cover "${name}" not found in src/assets/blog`);
  return url;
}

/** All posts, newest first, ready to be serialised into the client island. */
export async function getPosts(): Promise<BlogPost[]> {
  const entries = await getCollection('blog');

  return entries
    .map((entry) => ({
      slug: entry.id,
      title: entry.data.title,
      description: entry.data.description,
      date: entry.data.pubDate.toISOString(),
      tags: entry.data.tags,
      category: entry.data.category,
      readingMinutes: Math.max(1, Math.round((entry.body ?? '').split(/\s+/).length / WORDS_PER_MINUTE)),
      cover: coverUrl(entry.data.cover ?? categoryBySlug.get(entry.data.category)?.cover),
      html: entry.rendered?.html ?? '',
    }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

