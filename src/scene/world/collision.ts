import type { Vector3 } from 'three';
import { obstacles, walkableAreas, type Rect } from './cityLayout';

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

/** Keeps a circle of `radius` inside the walkable union. Mutates `position`. */
function constrainToWalkable(position: Vector3, radius: number) {
  let bestX = position.x;
  let bestZ = position.z;
  let bestDistSq = Infinity;

  for (const area of walkableAreas) {
    const x = clamp(position.x, area.minX + radius, area.maxX - radius);
    const z = clamp(position.z, area.minZ + radius, area.maxZ - radius);
    const distSq = (x - position.x) ** 2 + (z - position.z) ** 2;
    if (distSq === 0) return;
    if (distSq < bestDistSq) {
      bestDistSq = distSq;
      bestX = x;
      bestZ = z;
    }
  }

  position.x = bestX;
  position.z = bestZ;
}

/** Pushes a circle of `radius` out of a solid rect. Mutates `position`. */
function pushOutOfRect(position: Vector3, radius: number, rect: Rect) {
  const closestX = clamp(position.x, rect.minX, rect.maxX);
  const closestZ = clamp(position.z, rect.minZ, rect.maxZ);
  const dx = position.x - closestX;
  const dz = position.z - closestZ;
  const distSq = dx * dx + dz * dz;

  if (distSq >= radius * radius) return;

  if (distSq > 1e-8) {
    const dist = Math.sqrt(distSq);
    const push = (radius - dist) / dist;
    position.x += dx * push;
    position.z += dz * push;
    return;
  }

  // Centre is inside the rect: exit along the axis with the smallest overlap.
  const exits = [
    { axis: 'x', value: rect.minX - radius, cost: position.x - rect.minX },
    { axis: 'x', value: rect.maxX + radius, cost: rect.maxX - position.x },
    { axis: 'z', value: rect.minZ - radius, cost: position.z - rect.minZ },
    { axis: 'z', value: rect.maxZ + radius, cost: rect.maxZ - position.z },
  ] as const;
  const exit = exits.reduce((a, b) => (b.cost < a.cost ? b : a));
  position[exit.axis] = exit.value;
}

export function resolveCollisions(position: Vector3, radius: number) {
  for (const obstacle of obstacles) pushOutOfRect(position, radius, obstacle);
  constrainToWalkable(position, radius);
}

/** Returns the nearest walkable point for a tap target. Mutates `point`. */
export function clampToWalkable(point: Vector3, radius: number) {
  resolveCollisions(point, radius);
  return point;
}
