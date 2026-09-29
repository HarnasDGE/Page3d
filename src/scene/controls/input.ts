import { Vector3 } from 'three';

/**
 * Per-frame input state. Mutated by input sources (keyboard, joystick, taps)
 * and read inside useFrame, so it lives outside React state on purpose.
 */
export const input = {
  keys: {
    forward: false,
    backward: false,
    left: false,
    right: false,
    run: false,
  },
  /** x: right +, y: forward +, both in range -1..1 */
  joystick: { x: 0, y: 0 },
  moveTarget: new Vector3(),
  hasMoveTarget: false,
};

export function setMoveTarget(point: Vector3) {
  input.moveTarget.set(point.x, 0, point.z);
  input.hasMoveTarget = true;
}

export function clearMoveTarget() {
  input.hasMoveTarget = false;
}

export function resetInput() {
  const { keys, joystick } = input;
  keys.forward = keys.backward = keys.left = keys.right = keys.run = false;
  joystick.x = joystick.y = 0;
}
