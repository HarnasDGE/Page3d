import { getCollection } from 'astro:content';
import type { BlogPost } from '@/types/blog';

const WORDS_PER_MINUTE = 220;

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
      readingMinutes: Math.max(1, Math.round((entry.body ?? '').split(/\s+/).length / WORDS_PER_MINUTE)),
      html: entry.rendered?.html ?? '',
    }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

