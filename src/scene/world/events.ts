import type { ThreeEvent } from '@react-three/fiber';

/** Stops taps on solid objects from falling through to the ground behind them. */
export const blockTap = (event: ThreeEvent<MouseEvent>) => event.stopPropagation();
