import { Suspense } from 'react';
import { useTexture } from '@react-three/drei';
import { neon } from '@/scene/materials/neon';
import { PanelText } from './HoloPanel';

const FRAME = 0.08;

interface FramedImageProps {
  url: string;
  position: [number, number, number];
  rotationY?: number;
  width: number;
  height: number;
  accent: string;
  /** Optional caption under the frame. */
  caption?: string;
  subCaption?: string;
}

/** Backlit image (photo, screenshot, artwork) in a neon frame. */
export function FramedImage(props: FramedImageProps) {
  // Local boundary: the rest of the room renders while the image streams in.
  return (
    <Suspense fallback={null}>
      <FramedImageContent {...props} />
    </Suspense>
  );
}

function FramedImageContent({
  url,
  position,
  rotationY = 0,
  width,
  height,
  accent,
  caption,
  subCaption,
}: FramedImageProps) {
  const map = useTexture(url);
  const frame = neon(accent, 1.8);
  const edges: { position: [number, number, number]; size: [number, number, number] }[] = [
    { position: [0, height / 2, 0], size: [width + FRAME, FRAME, FRAME] },
    { position: [0, -height / 2, 0], size: [width + FRAME, FRAME, FRAME] },
    { position: [-width / 2, 0, 0], size: [FRAME, height, FRAME] },
    { position: [width / 2, 0, 0], size: [FRAME, height, FRAME] },
  ];

  return (
    <group position={position} rotation-y={rotationY}>
      <mesh>
        <planeGeometry args={[width, height]} />
        {/* Mostly self-lit so it reads like a screen or a lit print. */}
        <meshStandardMaterial map={map} emissiveMap={map} emissive="#ffffff" emissiveIntensity={0.75} />
      </mesh>
      {edges.map(({ position: edge, size }) => (
        <mesh key={edge.join()} position={edge}>
          <boxGeometry args={size} />
          <meshBasicMaterial color={frame} toneMapped={false} />
        </mesh>
      ))}
      {caption && (
        <group position={[-width / 2, -height / 2 - 0.18, 0.02]}>
          <PanelText font="display" size={0.2} color={accent} glow={2}>
            {caption}
          </PanelText>
          {subCaption && (
            <PanelText y={-0.3} size={0.24} color="#b9b3e6">
              {subCaption}
            </PanelText>
          )}
        </group>
      )}
    </group>
  );
}
