import { Vector3 } from 'three';
import { clampToWalkable } from '@/scene/world/collision';
import { onTap } from '@/scene/world/events';
import { setMoveTarget } from './input';

const TARGET_RADIUS = 0.5;

/** onClick handler for floors: sends the android to the tapped point. */
export const tapToMove = onTap((event) =>
  setMoveTarget(clampToWalkable(new Vector3().copy(event.point), TARGET_RADIUS)),
);
