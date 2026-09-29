export interface Service {
  slug: string;
  /** Short title that fits on the neon sign above the door. */
  sign: string;
  title: string;
  summary: string;
  accent: string;
}

export const services: Service[] = [
  {
    slug: 'websites',
    sign: 'WEBSITES',
    title: 'Websites & Landing Pages',
    summary: 'Fast, SEO-friendly marketing sites built with Astro and a headless CMS.',
    accent: '#00f0ff',
  },
  {
    slug: 'e-commerce',
    sign: 'E-COMMERCE',
    title: 'E-commerce Stores',
    summary: 'Custom storefronts with smooth checkout, integrated payments and analytics.',
    accent: '#ff2bd6',
  },
  {
    slug: 'web-apps',
    sign: 'WEB APPS',
    title: 'Web Applications',
    summary: 'Dashboards, SaaS products and internal tools with React and TypeScript.',
    accent: '#8b5cff',
  },
  {
    slug: 'performance',
    sign: 'SPEED & SEO',
    title: 'Performance & SEO',
    summary: 'Audits and fixes that push Core Web Vitals into the green.',
    accent: '#ffb800',
  },
];
