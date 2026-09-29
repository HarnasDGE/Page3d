/** Serialisable blog post handed from Astro to the 3D scene. */
export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  /** ISO date string. */
  date: string;
  tags: string[];
  readingMinutes: number;
  /** URL of the cover artwork, if the post has one. */
  cover?: string;
  /** Pre-rendered Markdown (trusted, from our own content collection). */
  html: string;
}
