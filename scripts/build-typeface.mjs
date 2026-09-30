/**
 * Converts the Orbitron Bold webfont into three.js "typeface" JSON for the
 * extruded 3D shop signs (drei <Text3D>). Only the characters the signs use
 * are kept, so the file stays small.
 *
 *   node scripts/build-typeface.mjs
 */
import { readFile, writeFile } from 'node:fs/promises';
import opentype from 'opentype.js';

const SOURCE = 'node_modules/@fontsource/orbitron/files/orbitron-latin-700-normal.woff';
const TARGET = 'src/assets/fonts/orbitron-bold.typeface.json';
const CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 &-/.?!\'';

const round = (value) => Math.round(value * 100) / 100;

/** opentype path commands -> typeface outline ("m x y l x y q x y cx cy b x y c1x c1y c2x c2y"). */
function toOutline(commands) {
  const parts = [];
  for (const c of commands) {
    switch (c.type) {
      case 'M':
        parts.push('m', round(c.x), round(c.y));
        break;
      case 'L':
        parts.push('l', round(c.x), round(c.y));
        break;
      case 'Q':
        parts.push('q', round(c.x), round(c.y), round(c.x1), round(c.y1));
        break;
      case 'C':
        parts.push('b', round(c.x), round(c.y), round(c.x1), round(c.y1), round(c.x2), round(c.y2));
        break;
    }
  }
  return parts.join(' ');
}

const buffer = await readFile(SOURCE);
const font = opentype.parse(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength));
const scale = 1000 / font.unitsPerEm;

const glyphs = {};
for (const char of CHARACTERS) {
  const glyph = font.charToGlyph(char);
  // Font units are y-up already; getPath flips to y-down, so read the raw path.
  const path = glyph.getPath(0, 0, 1000);
  const commands = path.commands.map((c) => {
    const flip = (y) => (y === undefined ? undefined : -y);
    return { ...c, y: flip(c.y), y1: flip(c.y1), y2: flip(c.y2) };
  });
  const box = glyph.getBoundingBox();
  glyphs[char] = {
    ha: round(glyph.advanceWidth * scale),
    x_min: round(box.x1 * scale),
    x_max: round(box.x2 * scale),
    o: toOutline(commands),
  };
}

const typeface = {
  glyphs,
  familyName: 'Orbitron',
  ascender: round(font.ascender * scale),
  descender: round(font.descender * scale),
  underlinePosition: round((font.tables.post?.underlinePosition ?? -100) * scale),
  underlineThickness: round((font.tables.post?.underlineThickness ?? 50) * scale),
  boundingBox: {
    xMin: round(font.tables.head.xMin * scale),
    yMin: round(font.tables.head.yMin * scale),
    xMax: round(font.tables.head.xMax * scale),
    yMax: round(font.tables.head.yMax * scale),
  },
  resolution: 1000,
  original_font_information: { fontFamily: 'Orbitron', license: 'SIL Open Font License 1.1' },
  cssFontWeight: 'bold',
  cssFontStyle: 'normal',
};

await writeFile(TARGET, JSON.stringify(typeface));
console.log(`Wrote ${TARGET} (${Object.keys(glyphs).length} glyphs)`);
