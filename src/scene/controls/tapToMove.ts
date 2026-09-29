import type { ThreeEvent } from '@react-three/fiber';
import { Vector3 } from 'three';
import { aim } from '@/scene/props/carry';
import { usePropsStore } from '@/scene/props/propsStore';
import { clampToWalkable } from '@/scene/world/collision';
import { onTap } from '@/scene/world/events';
import { setMoveTarget } from './input';

const TARGET_RADIUS = 0.5;

/** onClick handler for floors: throws the held can there, otherwise walks there. */
export const tapToMove = onTap((event) => {
  const { heldCanId, throwHeld } = usePropsStore.getState();
  if (heldCanId) {
    throwHeld(event.point);
    return;
  }
  setMoveTarget(clampToWalkable(new Vector3().copy(event.point), TARGET_RADIUS));
});

/** onPointerMove for floors: mouse aiming preview while holding a can. */
export const aimAtFloor = (event: ThreeEvent<PointerEvent>) => {
  aim.active = event.nativeEvent.pointerType === 'mouse';
  aim.point.copy(event.point);
};

export const stopAiming = () => {
  aim.active = false;
};
