import type { ThreeEvent } from '@react-three/fiber';

/** Pointer travel (px) above which a press counts as a camera drag, not a tap. */
export const TAP_MAX_DELTA = 8;

/** Stops taps on solid objects from falling through to the ground behind them. */
export const blockTap = (event: ThreeEvent<MouseEvent>) => event.stopPropagation();

/** Click handler that ignores camera drags and stops propagation. */
export const onTap =
  (handler: (event: ThreeEvent<MouseEvent>) => void) => (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    if (event.delta > TAP_MAX_DELTA) return;
    handler(event);
  };
