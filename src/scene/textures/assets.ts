// URLs of SVG artwork used as textures. `?url` keeps them as plain files, so
// the browser rasterises each SVG once and three.js uploads it as a texture.
import type { ProjectId } from '@/data/projects';
import arrow from '@/assets/svg/road/arrow.svg?url';
import asphalt from '@/assets/svg/road/asphalt.svg?url';
import crosswalk from '@/assets/svg/road/crosswalk.svg?url';
import manhole from '@/assets/svg/road/manhole.svg?url';
import byteClub from '@/assets/svg/posters/byte-club.svg?url';
import chromeDreams from '@/assets/svg/posters/chrome-dreams.svg?url';
import neuroNoodles from '@/assets/svg/posters/neuro-noodles.svg?url';
import synthwaveFm from '@/assets/svg/posters/synthwave-fm.svg?url';
import graffitiNeon from '@/assets/svg/facade/graffiti-neon.svg?url';
import graffitiTag from '@/assets/svg/facade/graffiti-tag.svg?url';
import shutter from '@/assets/svg/facade/shutter.svg?url';
import avatar from '@/assets/svg/interiors/avatar.svg?url';
import canCola from '@/assets/svg/props/can-cola.svg?url';
import canLemon from '@/assets/svg/props/can-lemon.svg?url';
import canWater from '@/assets/svg/props/can-water.svg?url';
import vendingFront from '@/assets/svg/props/vending-front.svg?url';
import projectAurora from '@/assets/svg/interiors/project-aurora.svg?url';
import projectPulse from '@/assets/svg/interiors/project-pulse.svg?url';
import projectVoltage from '@/assets/svg/interiors/project-voltage.svg?url';

export const ROAD_TEXTURES = { asphalt, crosswalk, arrow, manhole } as const;

/** Posters are 2:3 portrait artwork. */
export const POSTERS = [neuroNoodles, synthwaveFm, byteClub, chromeDreams] as const;

/** Graffiti pieces are 2:1 landscape artwork. */
export const GRAFFITI = [graffitiNeon, graffitiTag] as const;

export const FACADE_TEXTURES = { shutter } as const;

export const INTERIOR_TEXTURES = { avatar } as const;

export const PROP_TEXTURES = { vendingFront } as const;

/** Soda can labels (2:1, wrapped once around the can). */
export const CAN_LABELS = [canCola, canLemon, canWater] as const;

export const PROJECT_IMAGES: Record<ProjectId, string> = {
  aurora: projectAurora,
  voltage: projectVoltage,
  pulse: projectPulse,
};

/**
 * Optional brand logo: drop `src/assets/svg/non-agency-logo.svg` into the repo
 * and it replaces the neon text placeholder automatically (no code change).
 */
const logoFiles = import.meta.glob<string>('/src/assets/svg/non-agency-logo.svg', {
  query: '?url',
  import: 'default',
  eager: true,
});
export const NON_AGENCY_LOGO: string | undefined = Object.values(logoFiles)[0];
