import type { CollisionWorld } from '@/scene/world/collision';
import type { Rect } from '@/scene/world/cityLayout';
import type { VenueKind } from '@/scene/world/venues';

/**
 * Every venue interior shares one room shell. The exit door sits in the
 * middle of the +Z wall; each venue furnishes the room differently.
 */
export const ROOM = {
  halfWidth: 9,
  minZ: -16,
  maxZ: 2,
  height: 6.5,
} as const;

export const ROOM_CENTER_Z = (ROOM.minZ + ROOM.maxZ) / 2;

export const ROOM_SPAWN = { x: 0, z: -3, heading: Math.PI } as const;

export const EXIT_DOOR = { x: 0, z: ROOM.maxZ } as const;

/** Wall anchors for panels: position just off the wall and rotation facing the room. */
export const WALLS = {
  back: { x: 0, z: ROOM.minZ + 0.08, rotationY: 0 },
  left: { x: -ROOM.halfWidth + 0.08, z: ROOM_CENTER_Z, rotationY: Math.PI / 2 },
  right: { x: ROOM.halfWidth - 0.08, z: ROOM_CENTER_Z, rotationY: -Math.PI / 2 },
} as const;

/** Central exhibit (hologram pedestal, desk or tower). */
export const EXHIBIT = { x: 0, z: ROOM_CENTER_Z, halfSize: 1.6 } as const;

/** Blog terminals along the back wall. */
export const TERMINAL_SLOTS = [-5.5, 0, 5.5].map((x) => ({ x, z: ROOM.minZ + 1.6 }));
export const TERMINAL_HALF_SIZE = { x: 0.9, z: 0.6 } as const;

/** Contact console, off to the side so the tower stays the centrepiece. */
export const CONSOLE = { x: -5, z: -4.5 } as const;
export const CONSOLE_HALF_SIZE = { x: 1, z: 0.5 } as const;

const rectAround = (x: number, z: number, halfX: number, halfZ: number): Rect => ({
  minX: x - halfX,
  maxX: x + halfX,
  minZ: z - halfZ,
  maxZ: z + halfZ,
});

const floor: Rect = { minX: -ROOM.halfWidth, maxX: ROOM.halfWidth, minZ: ROOM.minZ, maxZ: ROOM.maxZ };
const exhibitRect = rectAround(EXHIBIT.x, EXHIBIT.z, EXHIBIT.halfSize, EXHIBIT.halfSize);

const OBSTACLES: Record<VenueKind, Rect[]> = {
  service: [exhibitRect],
  about: [rectAround(EXHIBIT.x, EXHIBIT.z, 1.8, 1)],
  blog: [
    exhibitRect,
    ...TERMINAL_SLOTS.map(({ x, z }) => rectAround(x, z, TERMINAL_HALF_SIZE.x, TERMINAL_HALF_SIZE.z)),
  ],
  contact: [exhibitRect, rectAround(CONSOLE.x, CONSOLE.z, CONSOLE_HALF_SIZE.x, CONSOLE_HALF_SIZE.z)],
};

export function roomWorldFor(kind: VenueKind): CollisionWorld {
  return { walkable: [floor], obstacles: OBSTACLES[kind] };
}
