import type { ProjectId } from './projects';

export type ServiceIcon = 'browser' | 'bag' | 'stack' | 'gauge';

export interface Service {
  slug: string;
  /** Short title that fits on the neon sign above the door. */
  sign: string;
  title: string;
  summary: string;
  deliverables: string[];
  process: string[];
  priceFrom: string;
  timeline: string;
  accent: string;
  icon: ServiceIcon;
  /** Two showcase projects for the portfolio screens (left and right wall). */
  projects: [ProjectId, ProjectId];
}

export const services: Service[] = [
  {
    slug: 'websites',
    sign: 'WEBSITES',
    title: 'Websites & Landing Pages',
    summary: 'Fast, SEO-friendly marketing sites built with Astro and a headless CMS your team can edit.',
    deliverables: [
      'Custom design & responsive build',
      'Headless CMS setup',
      'Technical SEO & analytics',
      '90+ Lighthouse score',
    ],
    process: ['Discovery call', 'Wireframes & design', 'Build & content', 'Launch & handover'],
    priceFrom: '€1,500',
    timeline: '2–4 weeks',
    accent: '#00f0ff',
    icon: 'browser',
    projects: ['aurora', 'voltage'],
  },
  {
    slug: 'e-commerce',
    sign: 'E-COMMERCE',
    title: 'E-commerce Stores',
    summary: 'Custom storefronts with a smooth checkout, integrated payments and analytics that drive sales.',
    deliverables: [
      'Shopify or headless storefront',
      'Payments & shipping setup',
      'Product catalogue migration',
      'Conversion tracking',
    ],
    process: ['Store audit', 'UX & design', 'Build & integrations', 'Launch & growth'],
    priceFrom: '€3,500',
    timeline: '4–8 weeks',
    accent: '#ff2bd6',
    icon: 'bag',
    projects: ['voltage', 'aurora'],
  },
  {
    slug: 'web-apps',
    sign: 'WEB APPS',
    title: 'Web Applications',
    summary: 'Dashboards, SaaS products and internal tools built with React, TypeScript and solid APIs.',
    deliverables: [
      'Product scoping & architecture',
      'React / Next.js front end',
      'API & database design',
      'Auth, tests & CI/CD',
    ],
    process: ['Scoping workshop', 'Prototype', 'Iterative sprints', 'Release & support'],
    priceFrom: '€6,000',
    timeline: '6–12 weeks',
    accent: '#8b5cff',
    icon: 'stack',
    projects: ['pulse', 'voltage'],
  },
  {
    slug: 'performance',
    sign: 'SPEED & SEO',
    title: 'Performance & SEO',
    summary: 'Audits and hands-on fixes that push Core Web Vitals into the green and lift organic traffic.',
    deliverables: [
      'Core Web Vitals audit',
      'Image, font & script fixes',
      'Technical SEO report',
      'Before / after benchmarks',
    ],
    process: ['Audit', 'Prioritised plan', 'Implementation', 'Monitoring'],
    priceFrom: '€800',
    timeline: '1–2 weeks',
    accent: '#ffb800',
    icon: 'gauge',
    projects: ['aurora', 'pulse'],
  },
];

export const serviceBySlug = new Map(services.map((service) => [service.slug, service]));
