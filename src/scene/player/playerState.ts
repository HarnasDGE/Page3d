import { Vector3 } from 'three';
import { PLAYER_SPAWN } from '@/scene/world/cityLayout';

/** Live player data shared between the player, camera rig and effects. */
export const player = {
  position: new Vector3(PLAYER_SPAWN.x, 0, PLAYER_SPAWN.z),
  /** Facing angle around Y; 0 looks towards +Z. */
  heading: Math.PI,
  /** Horizontal speed in units/s, drives the walk cycle. */
  speed: 0,
  /** Set by `teleportPlayer`, consumed by the Player to drop its momentum. */
  teleported: false,
};

/** Third-person camera settings (angles in radians). */
export const cameraOrbit = {
  yaw: 0,
  pitch: 0.38,
  distance: 7.5,
  /** Ceiling for the camera, e.g. inside rooms. */
  maxHeight: Infinity,
  /** When true the rig jumps straight to its target instead of easing. */
  snap: false,
};

export const PLAYER_RADIUS = 0.45;
export const WALK_SPEED = 4.5;
export const RUN_SPEED = 8.5;

export const STREET_CAMERA = { distance: 7.5, maxHeight: Infinity } as const;
export const ROOM_CAMERA = { distance: 5.5, maxHeight: 5.8 } as const;

interface TeleportOptions {
  x: number;
  z: number;
  heading: number;
  cameraYaw: number;
  camera: { distance: number; maxHeight: number };
}

/** Moves the player instantly (used behind the fade when changing location). */
export function teleportPlayer({ x, z, heading, cameraYaw, camera }: TeleportOptions) {
  player.position.set(x, 0, z);
  player.heading = heading;
  player.speed = 0;
  player.teleported = true;
  cameraOrbit.yaw = cameraYaw;
  cameraOrbit.distance = camera.distance;
  cameraOrbit.maxHeight = camera.maxHeight;
  cameraOrbit.snap = true;
}

// Dev-only handle for debugging and automated browser checks (teleports etc.).
if (import.meta.env.DEV && typeof window !== 'undefined') {
  Object.assign(window, { __neon: { player, cameraOrbit } });
}
