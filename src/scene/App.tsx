import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { PLAYER_SPAWN } from './world/cityLayout';
import { useKeyboardControls } from './controls/useKeyboardControls';
import { Experience } from './Experience';
import { useGameStore } from './store/gameStore';
import { Joystick } from './ui/Joystick';
import { LoadingScreen } from './ui/LoadingScreen';

export default function App() {
  useKeyboardControls();
  const setReady = useGameStore((state) => state.setReady);

  return (
    <>
      <Canvas
        className="!fixed inset-0"
        dpr={[1, 2]}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        camera={{ fov: 55, near: 0.1, far: 200, position: [PLAYER_SPAWN.x, 5, PLAYER_SPAWN.z + 8] }}
        onCreated={() => setReady(true)}
      >
        <Suspense fallback={null}>
          <Experience />
        </Suspense>
      </Canvas>
      <Joystick />
      <LoadingScreen />
    </>
  );
}
