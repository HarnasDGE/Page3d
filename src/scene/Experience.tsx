import { CameraRig } from './player/CameraRig';
import { MoveMarker } from './player/MoveMarker';
import { Player } from './player/Player';
import { City } from './world/City';

const SKY_COLOR = '#07060f';

export function Experience() {
  return (
    <>
      <color attach="background" args={[SKY_COLOR]} />
      <fog attach="fog" args={[SKY_COLOR, 18, 85]} />

      <hemisphereLight args={['#5b3bff', '#0a0620', 1.1]} />
      <ambientLight intensity={0.15} />
      <directionalLight position={[20, 40, 10]} intensity={0.35} color="#9fb4ff" />

      <City />
      <Player />
      <MoveMarker />
      <CameraRig />
    </>
  );
}
