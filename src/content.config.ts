import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { CATEGORY_SLUGS } from './data/blogCategories';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    /** Reading room the post lives in (see src/data/blogCategories.ts). */
    category: z.enum(CATEGORY_SLUGS),
    /** File name (without .svg) of the cover in src/assets/blog; defaults to the category's. */
    cover: z.string().optional(),
  }),
});

export const collections = { blog };
