import type { CollisionWorld } from '@/scene/world/collision';

/**
 * Every venue interior shares one room shell. The exit door sits in the
 * middle of the +Z wall; the exhibit (venue content) stands in the centre.
 */
export const ROOM = {
  halfWidth: 9,
  minZ: -16,
  maxZ: 2,
  height: 6.5,
} as const;

export const ROOM_CENTER_Z = (ROOM.minZ + ROOM.maxZ) / 2;

/** Footprint of the central exhibit the player walks around. */
export const EXHIBIT_HALF_SIZE = 1.6;

export const ROOM_SPAWN = { x: 0, z: -3, heading: Math.PI } as const;

export const EXIT_DOOR = { x: 0, z: ROOM.maxZ } as const;

export const roomWorld: CollisionWorld = {
  walkable: [{ minX: -ROOM.halfWidth, maxX: ROOM.halfWidth, minZ: ROOM.minZ, maxZ: ROOM.maxZ }],
  obstacles: [
    {
      minX: -EXHIBIT_HALF_SIZE,
      maxX: EXHIBIT_HALF_SIZE,
      minZ: ROOM_CENTER_Z - EXHIBIT_HALF_SIZE,
      maxZ: ROOM_CENTER_Z + EXHIBIT_HALF_SIZE,
    },
  ],
};
