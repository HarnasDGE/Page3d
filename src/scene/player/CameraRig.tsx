import { useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { MathUtils, PerspectiveCamera, Vector3 } from 'three';
import { resolveCollisions } from '@/scene/world/collision';
import { cameraOrbit, player } from './playerState';

const LOOK_HEIGHT = 1.4;
const MIN_PITCH = 0.12;
const MAX_PITCH = 1.15;
const YAW_SENSITIVITY = 0.006;
const PITCH_SENSITIVITY = 0.004;
const FOLLOW_DAMPING = 8;
/** Keeps the camera above the streets so it never ends up inside a building. */
const CAMERA_RADIUS = 0.3;
const LANDSCAPE_FOV = 55;
const PORTRAIT_FOV = 72;

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

  // Portrait screens get a wider field of view so the streets stay readable.
  const aspect = useThree((state) => state.viewport.aspect);
  useEffect(() => {
    if (!(camera instanceof PerspectiveCamera)) return;
    camera.fov = aspect < 1 ? PORTRAIT_FOV : LANDSCAPE_FOV;
    camera.updateProjectionMatrix();
  }, [camera, aspect]);

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const { yaw, pitch, distance, maxHeight } = cameraOrbit;
    const horizontal = Math.cos(pitch) * distance;

    desired.set(
      player.position.x + Math.sin(yaw) * horizontal,
      Math.min(Math.sin(pitch) * distance + LOOK_HEIGHT, maxHeight),
      player.position.z + Math.cos(yaw) * horizontal,
    );
    resolveCollisions(desired, CAMERA_RADIUS);

    lookAt.set(player.position.x, LOOK_HEIGHT, player.position.z);

    if (cameraOrbit.snap) {
      cameraOrbit.snap = false;
      camera.position.copy(desired);
      camera.lookAt(lookAt);
      return;
    }

    camera.position.x = MathUtils.damp(camera.position.x, desired.x, FOLLOW_DAMPING, delta);
    camera.position.y = MathUtils.damp(camera.position.y, desired.y, FOLLOW_DAMPING, delta);
    camera.position.z = MathUtils.damp(camera.position.z, desired.z, FOLLOW_DAMPING, delta);
    camera.lookAt(lookAt);
  });

  return null;
}
