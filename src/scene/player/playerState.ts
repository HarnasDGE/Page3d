import { Vector3 } from 'three';
import { PLAYER_SPAWN } from '@/scene/world/cityLayout';

/** Live player data shared between the player, camera rig and effects. */
export const player = {
  position: new Vector3(PLAYER_SPAWN.x, 0, PLAYER_SPAWN.z),
  /** Horizontal speed in units/s, drives the walk cycle. */
  speed: 0,
};

/** Orbit angles of the third-person camera (radians). */
export const cameraOrbit = {
  yaw: 0,
  pitch: 0.38,
};

export const PLAYER_RADIUS = 0.45;
export const WALK_SPEED = 4.5;
export const RUN_SPEED = 8.5;

// Dev-only handle for debugging and automated browser checks (teleports etc.).
if (import.meta.env.DEV && typeof window !== 'undefined') {
  Object.assign(window, { __neon: { player, cameraOrbit } });
}
