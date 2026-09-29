import orbitronBold from '@fontsource/orbitron/files/orbitron-latin-700-normal.woff?url';
import rajdhaniSemibold from '@fontsource/rajdhani/files/rajdhani-latin-600-normal.woff?url';

/** Font files for in-scene text (troika needs woff/ttf urls, not CSS). */
export const FONTS = {
  display: orbitronBold,
  body: rajdhaniSemibold,
} as const;
