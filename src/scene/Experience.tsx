import { PerformanceMonitor } from '@react-three/drei';
import { PostEffects } from './effects/PostEffects';
import { Rain } from './effects/Rain';
import { CameraRig } from './player/CameraRig';
import { MoveMarker } from './player/MoveMarker';
import { Player } from './player/Player';
import { useGameStore } from './store/gameStore';
import { City } from './world/City';
import { HORIZON_COLOR, SkyDome } from './world/SkyDome';

export function Experience() {
  const setQuality = useGameStore((state) => state.setQuality);

  return (
    <>
      {/* Drop to low quality for good once the frame rate keeps falling. */}
      <PerformanceMonitor onFallback={() => setQuality('low')} onDecline={() => setQuality('low')} />

      <SkyDome />
      <fog attach="fog" args={[HORIZON_COLOR, 25, 170]} />

      <hemisphereLight args={['#6a4bff', '#1a0c30', 1.6]} />
      <ambientLight intensity={0.15} />
      <directionalLight position={[20, 40, 10]} intensity={0.35} color="#9fb4ff" />

      <City />
      <Player />
      <MoveMarker />
      <CameraRig />
      <Rain />
      <PostEffects />
    </>
  );
}
