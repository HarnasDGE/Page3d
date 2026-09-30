import type { ThreeEvent } from '@react-three/fiber';
import { usePropsStore } from '@/scene/props/propsStore';

/** Pointer travel (px) above which a press counts as a camera drag, not a tap. */
export const TAP_MAX_DELTA = 8;

/** While holding a can, any tap or click throws it at the tapped point. */
function throwIfHolding(event: ThreeEvent<MouseEvent>) {
  const { heldCanId, throwHeld } = usePropsStore.getState();
  if (!heldCanId) return false;
  throwHeld(event.point);
  return true;
}

/** Stops taps on solid objects from falling through to the ground behind them. */
export const blockTap = (event: ThreeEvent<MouseEvent>) => {
  event.stopPropagation();
  if (event.delta <= TAP_MAX_DELTA) throwIfHolding(event);
};

/**
 * Click handler that ignores camera drags and stops propagation. With a can in
 * hand the tap becomes a throw at that point (hoops, doors, walls included).
 */
export const onTap =
  (handler: (event: ThreeEvent<MouseEvent>) => void) => (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    if (event.delta > TAP_MAX_DELTA || throwIfHolding(event)) return;
    handler(event);
  };
