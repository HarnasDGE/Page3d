import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { PLAYER_SPAWN } from './world/cityLayout';
import { useActionKeys } from './controls/useActionKeys';
import { useKeyboardControls } from './controls/useKeyboardControls';
import { Experience } from './Experience';
import { useGameStore } from './store/gameStore';
import { FadeOverlay } from './ui/FadeOverlay';
import { InteractionPrompt } from './ui/InteractionPrompt';
import { Joystick } from './ui/Joystick';
import { LoadingScreen } from './ui/LoadingScreen';
import { LocationBar } from './ui/LocationBar';

export default function App() {
  useKeyboardControls();
  useActionKeys();
  const setReady = useGameStore((state) => state.setReady);
  const quality = useGameStore((state) => state.quality);

  return (
    <>
      <Canvas
        className="!fixed inset-0"
        dpr={quality === 'high' ? [1, 2] : [1, 1.5]}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        camera={{ fov: 55, near: 0.1, far: 500, position: [PLAYER_SPAWN.x, 5, PLAYER_SPAWN.z + 8] }}
        onCreated={() => setReady(true)}
      >
        <Suspense fallback={null}>
          <Experience />
        </Suspense>
      </Canvas>
      <LocationBar />
      <InteractionPrompt />
      <Joystick />
      <FadeOverlay />
      <LoadingScreen />
    </>
  );
}
