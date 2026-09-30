import type { ThreeEvent } from '@react-three/fiber';
import { Vector3 } from 'three';
import { aim } from '@/scene/props/carry';
import { clampToWalkable } from '@/scene/world/collision';
import { onTap } from '@/scene/world/events';
import { setMoveTarget } from './input';

const TARGET_RADIUS = 0.5;

/** onClick handler for floors: walks there (onTap turns it into a throw while holding a can). */
export const tapToMove = onTap((event) =>
  setMoveTarget(clampToWalkable(new Vector3().copy(event.point), TARGET_RADIUS)),
);

/** onPointerMove for floors: mouse aiming preview while holding a can. */
export const aimAtFloor = (event: ThreeEvent<PointerEvent>) => {
  aim.active = event.nativeEvent.pointerType === 'mouse';
  aim.point.copy(event.point);
};

export const stopAiming = () => {
  aim.active = false;
};
