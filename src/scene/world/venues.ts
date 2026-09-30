import { blogCategories } from '@/data/blogCategories';
import { services } from '@/data/services';
import { ACCENTS } from './cityLayout';

export type VenueKind = 'service' | 'about' | 'blog' | 'contact';

export interface Venue {
  buildingId: string;
  kind: VenueKind;
  /** Text on the neon sign above the door. */
  sign: string;
  accent: string;
  /** Service slug (`kind: 'service'`) or blog category slug (`kind: 'blog'`). */
  slug?: string;
}

const SERVICE_BUILDINGS = ['services-l0', 'services-r0', 'services-l1', 'services-r1'];
/** Blog Alley: one reading room per category. */
const BLOG_BUILDINGS = ['blog-l0', 'blog-r0', 'blog-l1', 'blog-r1'];

/** Buildings you can enter. Everything else is decoration. */
export const venues: Venue[] = [
  ...services.map<Venue>((service, i) => ({
    buildingId: SERVICE_BUILDINGS[i],
    kind: 'service',
    sign: service.sign,
    accent: service.accent,
    slug: service.slug,
  })),
  { buildingId: 'about-l0', kind: 'about', sign: 'DEV STUDIO', accent: ACCENTS.violet },
  ...blogCategories.map<Venue>((category, i) => ({
    buildingId: BLOG_BUILDINGS[i],
    kind: 'blog',
    sign: category.sign,
    accent: category.accent,
    slug: category.slug,
  })),
  { buildingId: 'contact-l0', kind: 'contact', sign: 'SIGNAL TOWER', accent: ACCENTS.magenta },
];

export const venueByBuilding = new Map(venues.map((venue) => [venue.buildingId, venue]));
