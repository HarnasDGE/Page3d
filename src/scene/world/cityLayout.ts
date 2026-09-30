/**
 * Single source of truth for the city grid. Rendering and collisions are both
 * derived from this data, so moving a building here moves its collider too.
 *
 * Streets are authored in "local" space (running north, towards -Z) and then
 * rotated in 90° steps into place around the central plaza.
 */

export type StreetId = 'services' | 'blog' | 'contact' | 'about';

export interface Rect {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export interface Point {
  x: number;
  z: number;
}

export interface Building {
  id: string;
  street: StreetId | 'plaza';
  x: number;
  z: number;
  width: number;
  depth: number;
  height: number;
  accent: string;
  /** Unit vector pointing out of the main facade (towards the street). */
  facing: Point;
  /** Ground point in the middle of the main facade, where the entrance sits. */
  door: Point;
}

/** Rotation that turns a group's +Z towards the building's facing vector. */
export const facingRotation = (building: Building) => Math.atan2(building.facing.x, building.facing.z);

/** Length of the main facade (the side the door is on). */
export const facadeLength = (building: Building) =>
  building.facing.x !== 0 ? building.depth : building.width;

/**
 * World position of a point given in a building's facade space:
 * x runs along the facade (from the door), z points out towards the street.
 */
export function facadePoint(building: Building, alongX: number, outZ: number): Point {
  const angle = facingRotation(building);
  return {
    x: building.door.x + alongX * Math.cos(angle) + outZ * Math.sin(angle),
    z: building.door.z - alongX * Math.sin(angle) + outZ * Math.cos(angle),
  };
}

export interface Street {
  id: StreetId;
  label: string;
  accent: string;
  area: Rect;
}

export const PLAZA_HALF_SIZE = 14;
export const STREET_HALF_WIDTH = 5;
export const STREET_LENGTH = 56;

export const BUILDING_WIDTH = 12;
export const BUILDING_DEPTH = 14;
export const BUILDING_GAP = 2;
export const BUILDINGS_PER_SIDE = 3;
/** Streets overlap the plaza a bit so the walkable areas stay connected. */
const STREET_OVERLAP = 2;

export const ACCENTS = {
  cyan: '#00f0ff',
  magenta: '#ff2bd6',
  violet: '#8b5cff',
  amber: '#ffb800',
} as const;

type Transform = (p: Point) => Point;

const DIRECTIONS: Record<StreetId, Transform> = {
  services: ({ x, z }) => ({ x, z }), // north
  blog: ({ x, z }) => ({ x: -z, z: x }), // east
  contact: ({ x, z }) => ({ x: -x, z: -z }), // south
  about: ({ x, z }) => ({ x: z, z: -x }), // west
};

/**
 * Y rotation matching each street transform, so decor can be authored once in
 * local street space and placed with `<group rotation-y={STREET_ROTATION[id]}>`.
 */
export const STREET_ROTATION: Record<StreetId, number> = {
  services: 0,
  blog: -Math.PI / 2,
  contact: Math.PI,
  about: Math.PI / 2,
};

const STREET_META: Record<StreetId, { label: string; accent: string }> = {
  services: { label: 'Services Avenue', accent: ACCENTS.cyan },
  blog: { label: 'Blog Alley', accent: ACCENTS.amber },
  contact: { label: 'Contact Street', accent: ACCENTS.magenta },
  about: { label: 'About Street', accent: ACCENTS.violet },
};

function transformRect(rect: Rect, transform: Transform): Rect {
  const a = transform({ x: rect.minX, z: rect.minZ });
  const b = transform({ x: rect.maxX, z: rect.maxZ });
  return {
    minX: Math.min(a.x, b.x),
    maxX: Math.max(a.x, b.x),
    minZ: Math.min(a.z, b.z),
    maxZ: Math.max(a.z, b.z),
  };
}

/** Rotation-only transforms are linear, so they also rotate direction vectors. */
const place = (transform: Transform, facing: Point, door: Point) => ({
  facing: transform(facing),
  door: transform(door),
});

function rectToBuilding(
  rect: Rect,
  base: Omit<Building, 'x' | 'z' | 'width' | 'depth'>,
): Building {
  return {
    ...base,
    x: (rect.minX + rect.maxX) / 2,
    z: (rect.minZ + rect.maxZ) / 2,
    width: rect.maxX - rect.minX,
    depth: rect.maxZ - rect.minZ,
  };
}

function buildStreet(id: StreetId): { street: Street; buildings: Building[] } {
  const transform = DIRECTIONS[id];
  const { label, accent } = STREET_META[id];
  const streetEnd = -(PLAZA_HALF_SIZE + STREET_LENGTH);

  const area = transformRect(
    {
      minX: -STREET_HALF_WIDTH,
      maxX: STREET_HALF_WIDTH,
      minZ: streetEnd,
      maxZ: -PLAZA_HALF_SIZE + STREET_OVERLAP,
    },
    transform,
  );

  const buildings: Building[] = [];

  for (let i = 0; i < BUILDINGS_PER_SIDE; i++) {
    const maxZ = -PLAZA_HALF_SIZE - 1 - i * (BUILDING_DEPTH + BUILDING_GAP);
    const minZ = maxZ - BUILDING_DEPTH;

    for (const side of [-1, 1] as const) {
      const inner = side * STREET_HALF_WIDTH;
      const outer = side * (STREET_HALF_WIDTH + BUILDING_WIDTH);
      buildings.push(
        rectToBuilding(
          transformRect(
            { minX: Math.min(inner, outer), maxX: Math.max(inner, outer), minZ, maxZ },
            transform,
          ),
          {
            id: `${id}-${side < 0 ? 'l' : 'r'}${i}`,
            street: id,
            height: 14 + ((i * 7 + (side + 1) * 5) % 12),
            accent,
            ...place(transform, { x: -side, z: 0 }, { x: inner, z: (minZ + maxZ) / 2 }),
          },
        ),
      );
    }
  }

  // End cap closing the street.
  const capWidth = STREET_HALF_WIDTH + BUILDING_WIDTH;
  buildings.push(
    rectToBuilding(
      transformRect(
        { minX: -capWidth, maxX: capWidth, minZ: streetEnd - 12, maxZ: streetEnd },
        transform,
      ),
      {
        id: `${id}-end`,
        street: id,
        height: 30,
        accent,
        ...place(transform, { x: 0, z: 1 }, { x: 0, z: streetEnd }),
      },
    ),
  );

  return { street: { id, label, accent, area }, buildings };
}

function buildPlazaCorners(): Building[] {
  const inner = PLAZA_HALF_SIZE + 1;
  const outer = PLAZA_HALF_SIZE + 1 + 16;
  const accents = [ACCENTS.magenta, ACCENTS.cyan, ACCENTS.violet, ACCENTS.amber];

  return [
    [-1, -1],
    [1, -1],
    [1, 1],
    [-1, 1],
  ].map(([sx, sz], i) => {
    const xs = [sx * inner, sx * outer];
    const zs = [sz * inner, sz * outer];
    return rectToBuilding(
      {
        minX: Math.min(...xs),
        maxX: Math.max(...xs),
        minZ: Math.min(...zs),
        maxZ: Math.max(...zs),
      },
      {
        id: `plaza-${i}`,
        street: 'plaza',
        height: 38 + i * 6,
        accent: accents[i],
        facing: { x: -sx, z: 0 },
        door: { x: sx * inner, z: (sz * (inner + outer)) / 2 },
      },
    );
  });
}

const STREET_IDS: StreetId[] = ['services', 'blog', 'contact', 'about'];
const generated = STREET_IDS.map(buildStreet);

export const streets: Street[] = generated.map((g) => g.street);

export const buildings: Building[] = [
  ...generated.flatMap((g) => g.buildings),
  ...buildPlazaCorners(),
];

export const plazaArea: Rect = {
  minX: -PLAZA_HALF_SIZE,
  maxX: PLAZA_HALF_SIZE,
  minZ: -PLAZA_HALF_SIZE,
  maxZ: PLAZA_HALF_SIZE,
};

/** Areas the player can walk on (union of rects). */
export const walkableAreas: Rect[] = [plazaArea, ...streets.map((s) => s.area)];

/** Interactive street furniture in the plaza corners, each facing the plaza centre. */
export const VENDING_MACHINE = { x: 11.2, z: 11.2, rotationY: -Math.PI * 0.75 } as const;
/** Basketball hoop on the west side of the plaza, facing the centre. */
export const BASKETBALL_HOOPS = [{ id: 'plaza', x: -9.5, z: 0, rotationY: Math.PI / 2 }] as const;
/** Kickable trash bins: plaza corner, Services Avenue and Blog Alley (by the lamps). */
export const TRASH_BINS = [
  { id: 'bin-plaza', x: -11, z: 10.6 },
  { id: 'bin-services', x: 4.2, z: -31.5 },
  { id: 'bin-blog', x: 31.5, z: 4.2 },
] as const;

const square = (x: number, z: number, half: number): Rect => ({
  minX: x - half,
  maxX: x + half,
  minZ: z - half,
  maxZ: z + half,
});

/** Solid props standing inside walkable areas. */
export const obstacles: Rect[] = [
  // Central hologram pedestal.
  { minX: -2, maxX: 2, minZ: -2, maxZ: 2 },
  square(VENDING_MACHINE.x, VENDING_MACHINE.z, 0.9),
  ...BASKETBALL_HOOPS.map((hoop) => square(hoop.x, hoop.z, 0.3)),
];

export const PLAYER_SPAWN = { x: 0, z: 8 } as const;
