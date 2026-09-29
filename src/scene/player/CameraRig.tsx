import { useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { MathUtils, Vector3 } from 'three';
import { resolveCollisions } from '@/scene/world/collision';
import { cameraOrbit, player } from './playerState';

const DISTANCE = 7.5;
const LOOK_HEIGHT = 1.4;
const MIN_PITCH = 0.12;
const MAX_PITCH = 1.15;
const YAW_SENSITIVITY = 0.006;
const PITCH_SENSITIVITY = 0.004;
const FOLLOW_DAMPING = 8;
/** Keeps the camera above the streets so it never ends up inside a building. */
const CAMERA_RADIUS = 0.3;

const desired = new Vector3();
const lookAt = new Vector3();

/** Third-person orbit camera: drag (mouse or finger) to look around. */
export function CameraRig() {
  const camera = useThree((state) => state.camera);
  const element = useThree((state) => state.gl.domElement);

  useEffect(() => {
    let activePointer: number | null = null;
    let lastX = 0;
    let lastY = 0;

    const onPointerDown = (event: PointerEvent) => {
      if (activePointer !== null || event.button > 0) return;
      activePointer = event.pointerId;
      lastX = event.clientX;
      lastY = event.clientY;
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerId !== activePointer) return;
      cameraOrbit.yaw -= (event.clientX - lastX) * YAW_SENSITIVITY;
      cameraOrbit.pitch = MathUtils.clamp(
        cameraOrbit.pitch + (event.clientY - lastY) * PITCH_SENSITIVITY,
        MIN_PITCH,
        MAX_PITCH,
      );
      lastX = event.clientX;
      lastY = event.clientY;
    };

    const onPointerUp = (event: PointerEvent) => {
      if (event.pointerId === activePointer) activePointer = null;
    };

    element.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
    return () => {
      element.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
    };
  }, [element]);

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const { yaw, pitch } = cameraOrbit;
    const horizontal = Math.cos(pitch) * DISTANCE;

    desired.set(
      player.position.x + Math.sin(yaw) * horizontal,
      Math.sin(pitch) * DISTANCE + LOOK_HEIGHT,
      player.position.z + Math.cos(yaw) * horizontal,
    );
    resolveCollisions(desired, CAMERA_RADIUS);

    camera.position.x = MathUtils.damp(camera.position.x, desired.x, FOLLOW_DAMPING, delta);
    camera.position.y = MathUtils.damp(camera.position.y, desired.y, FOLLOW_DAMPING, delta);
    camera.position.z = MathUtils.damp(camera.position.z, desired.z, FOLLOW_DAMPING, delta);

    lookAt.set(player.position.x, LOOK_HEIGHT, player.position.z);
    camera.lookAt(lookAt);
  });

  return null;
}
