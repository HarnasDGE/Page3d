import { Vector3 } from 'three';
import { player } from '@/scene/player/playerState';
import { HOOP_ASSIST_RADIUS, nearestHoop } from './propLayout';

export const GRAVITY = 9.81;
/** Max horizontal throw distance. */
export const MAX_THROW_DISTANCE = 16;
/** Where a held item sits relative to the android (arm raised forward). */
export const HAND_OFFSET = new Vector3(0.4, 1.2, 0.62);
/** Ratio of vertical to horizontal speed when a lob reaches the rim. */
const LOB_STEEPNESS = 1.5;
/** Height of a can's centre when lying on the ground. */
const LANDING_HEIGHT = 0.2;

/** Throw distance range covered by the power meter. */
export const MIN_THROW_DISTANCE = 2;
/** Time for the power meter to fill once; it then swings back down and up again. */
export const CHARGE_CYCLE_MS = 1100;

const forward = new Vector3();

/** World position of the android's hand. Mutates and returns `out`. */
export function getHandPosition(out: Vector3) {
  const sin = Math.sin(player.heading);
  const cos = Math.cos(player.heading);
  return out.set(
    player.position.x + HAND_OFFSET.x * cos + HAND_OFFSET.z * sin,
    HAND_OFFSET.y,
    player.position.z - HAND_OFFSET.x * sin + HAND_OFFSET.z * cos,
  );
}

/**
 * Power (0..1) after holding the throw for `heldMs`: fills, then swings back,
 * so releasing at the right moment is the skill.
 */
export function chargePower(heldMs: number) {
  const phase = (heldMs / CHARGE_CYCLE_MS) % 2;
  return phase <= 1 ? phase : 2 - phase;
}

/** Point on the ground the can is thrown at for a given power, straight ahead. */
export function chargedThrowPoint(power: number, out: Vector3) {
  const distance = MIN_THROW_DISTANCE + power * (MAX_THROW_DISTANCE - MIN_THROW_DISTANCE);
  const sin = Math.sin(player.heading);
  const cos = Math.cos(player.heading);
  return out.set(player.position.x + sin * distance, 0, player.position.z + cos * distance);
}

/** Unit vector the android is facing. */
export function getForward(out: Vector3 = forward) {
  return out.set(Math.sin(player.heading), 0, Math.cos(player.heading));
}

/** Target clamped to the max throw distance, resting on the ground. */
export function clampThrowTarget(from: Vector3, target: Vector3, out: Vector3) {
  out.set(target.x - from.x, 0, target.z - from.z);
  const distance = out.length();
  if (distance > MAX_THROW_DISTANCE) out.multiplyScalar(MAX_THROW_DISTANCE / distance);
  return out.set(from.x + out.x, LANDING_HEIGHT, from.z + out.z);
}

/** Flight time grows with distance so long throws arc higher. */
export function flightTime(from: Vector3, to: Vector3) {
  const distance = Math.hypot(to.x - from.x, to.z - from.z);
  return Math.min(Math.max(distance / 11, 0.35), 1.1);
}

/** Launch velocity that lands exactly on `to` after `time` seconds. */
export function ballisticVelocity(from: Vector3, to: Vector3, time: number, out: Vector3) {
  return out.set(
    (to.x - from.x) / time,
    (to.y - from.y + 0.5 * GRAVITY * time * time) / time,
    (to.z - from.z) / time,
  );
}

/** Position along the arc at `t` seconds (for the trajectory preview). */
export function pointOnArc(from: Vector3, velocity: Vector3, t: number, out: Vector3) {
  return out.set(
    from.x + velocity.x * t,
    from.y + velocity.y * t - 0.5 * GRAVITY * t * t,
    from.z + velocity.z * t,
  );
}

/**
 * Resolves a throw at `point`: fills the landing/aim target and launch
 * velocity, returns the flight time. Throws near a hoop are steered into its
 * rim with a higher, dropping arc.
 */
export function computeThrow(from: Vector3, point: Vector3, outTarget: Vector3, outVelocity: Vector3) {
  const { hoop, distance: toRim } = nearestHoop(point.x, point.z);
  if (toRim < HOOP_ASSIST_RADIUS) {
    const { rim } = hoop;
    outTarget.set(rim.x, rim.y + 0.1, rim.z);
    const distance = Math.hypot(outTarget.x - from.x, outTarget.z - from.z);
    const rise = outTarget.y - from.y;
    // Lob: pick the flight time so the can drops in steeply (vertical speed at
    // the rim ≈ LOB_STEEPNESS × horizontal speed) instead of skimming the rim.
    const time = Math.sqrt((2 * (LOB_STEEPNESS * distance + rise)) / GRAVITY);
    ballisticVelocity(from, outTarget, time, outVelocity);
    return time;
  }
  clampThrowTarget(from, point, outTarget);
  const time = flightTime(from, outTarget);
  ballisticVelocity(from, outTarget, time, outVelocity);
  return time;
}
