import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MathUtils, Vector3, type Group } from 'three';
import { clearMoveTarget, input } from '@/scene/controls/input';
import {
  cancelPendingInteraction,
  findNearestInteractable,
  takePendingInteraction,
} from '@/scene/interaction/interactables';
import { useGameStore } from '@/scene/store/gameStore';
import { resolveCollisions } from '@/scene/world/collision';
import { ACCENTS } from '@/scene/world/cityLayout';
import { Android } from './Android';
import { cameraOrbit, player, PLAYER_RADIUS, RUN_SPEED, WALK_SPEED } from './playerState';

const ACCELERATION = 12;
const TURN_SPEED = 12;
const ARRIVE_DISTANCE = 0.25;
/** Tap targets further than this make the android run. */
const RUN_TO_TARGET_DISTANCE = 10;
/** Give up on a tap target after being blocked for this long (s). */
const STUCK_TIMEOUT = 0.4;

const direction = new Vector3();
const velocity = new Vector3();
const previous = new Vector3();

/** Shortest signed angle difference, keeps rotation from spinning the long way. */
function angleDelta(from: number, to: number) {
  return Math.atan2(Math.sin(to - from), Math.cos(to - from));
}

export function Player() {
  const root = useRef<Group>(null);
  const stuckTime = useRef(0);

  // Runs before the camera rig (default priority 0).
  useFrame((_, rawDelta) => {
    const group = root.current;
    if (!group) return;
    const delta = Math.min(rawDelta, 0.05);
    const { keys, joystick } = input;
    const { isFading, nearbyId, setNearby } = useGameStore.getState();

    if (player.teleported) {
      player.teleported = false;
      velocity.set(0, 0, 0);
      stuckTime.current = 0;
    }

    // Manual input in camera space (x: right, y: forward).
    const inputX = Number(keys.right) - Number(keys.left) + joystick.x;
    const inputY = Number(keys.forward) - Number(keys.backward) + joystick.y;
    const inputLength = Math.min(Math.hypot(inputX, inputY), 1);

    let targetSpeed = 0;
    direction.set(0, 0, 0);

    if (isFading) {
      // Frozen while the screen is black and the location swaps.
    } else if (inputLength > 0.05) {
      clearMoveTarget();
      cancelPendingInteraction();
      const sin = Math.sin(cameraOrbit.yaw);
      const cos = Math.cos(cameraOrbit.yaw);
      // forward = (-sin, -cos), right = (cos, -sin)
      direction.set(inputX * cos - inputY * sin, 0, -inputX * sin - inputY * cos).normalize();
      const isJoystick = joystick.x !== 0 || joystick.y !== 0;
      targetSpeed = isJoystick
        ? RUN_SPEED * inputLength
        : keys.run
          ? RUN_SPEED
          : WALK_SPEED;
    } else if (input.hasMoveTarget) {
      direction.subVectors(input.moveTarget, player.position).setY(0);
      const distance = direction.length();
      if (distance < ARRIVE_DISTANCE) {
        clearMoveTarget();
      } else {
        direction.divideScalar(distance);
        const cruise = distance > RUN_TO_TARGET_DISTANCE ? RUN_SPEED : WALK_SPEED;
        // Ease in on arrival.
        targetSpeed = Math.min(cruise, distance * 3);
      }
    }

    velocity.x = MathUtils.damp(velocity.x, direction.x * targetSpeed, ACCELERATION, delta);
    velocity.z = MathUtils.damp(velocity.z, direction.z * targetSpeed, ACCELERATION, delta);

    previous.copy(player.position);
    player.position.addScaledVector(velocity, delta);
    resolveCollisions(player.position, PLAYER_RADIUS);

    const moved = previous.distanceTo(player.position);
    player.speed = moved / delta;

    // Drop an unreachable tap target instead of pushing against a wall forever.
    if (input.hasMoveTarget && targetSpeed > 0.5 && player.speed < targetSpeed * 0.2) {
      stuckTime.current += delta;
      if (stuckTime.current > STUCK_TIMEOUT) clearMoveTarget();
    } else {
      stuckTime.current = 0;
    }

    if (velocity.lengthSq() > 0.05) {
      const heading = Math.atan2(velocity.x, velocity.z);
      player.heading += angleDelta(player.heading, heading) * Math.min(TURN_SPEED * delta, 1);
    }

    group.position.copy(player.position);
    group.rotation.y = player.heading;

    if (isFading) return;

    const nearby = findNearestInteractable(player.position.x, player.position.z);
    const nextNearbyId = nearby?.id ?? null;
    if (nextNearbyId !== nearbyId) setNearby(nextNearbyId);

    // A tapped door / terminal fires as soon as the android reaches it.
    takePendingInteraction(nextNearbyId)?.activate();
  }, -1);

  return (
    <group ref={root} position={player.position.toArray()} rotation-y={player.heading}>
      <Android />
      <pointLight position={[0, 2.2, 0.6]} color={ACCENTS.cyan} intensity={6} distance={7} />
    </group>
  );
}
