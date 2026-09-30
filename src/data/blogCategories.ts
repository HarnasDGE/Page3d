/** Blog categories: each one is its own reading room in Blog Alley. */
export const blogCategories = [
  {
    slug: 'performance',
    name: 'Performance',
    sign: 'PERFORMANCE',
    description: 'Core Web Vitals, caching and making sites feel instant.',
    accent: '#ffb800',
    cover: 'web-vitals',
  },
  {
    slug: 'frontend',
    name: 'Frontend',
    sign: 'FRONTEND',
    description: 'Astro, React, TypeScript and CSS in day-to-day client work.',
    accent: '#00f0ff',
    cover: 'astro-islands',
  },
  {
    slug: 'creative',
    name: 'Creative 3D',
    sign: 'CREATIVE 3D',
    description: 'WebGL, shaders and interactive experiences in the browser.',
    accent: '#ff2bd6',
    cover: 'neon-city',
  },
  {
    slug: 'freelance',
    name: 'Freelance',
    sign: 'FREELANCE',
    description: 'Scoping, pricing and running web projects as a freelancer.',
    accent: '#8b5cff',
    cover: 'freelance',
  },
] as const;

export type BlogCategory = (typeof blogCategories)[number];
export type BlogCategorySlug = BlogCategory['slug'];

export const CATEGORY_SLUGS = blogCategories.map((category) => category.slug) as [
  BlogCategorySlug,
  ...BlogCategorySlug[],
];

export const categoryBySlug = new Map<string, BlogCategory>(
  blogCategories.map((category) => [category.slug, category]),
);

/** Articles per floor of a reading room; extra ones go upstairs. */
export const POSTS_PER_PAGE = 4;
