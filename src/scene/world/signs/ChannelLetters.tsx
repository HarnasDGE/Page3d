import { useCallback, useMemo, useRef } from 'react';
import { Center, Text3D } from '@react-three/drei';
import { MeshBasicMaterial, MeshStandardMaterial } from 'three';
import signFont from '@/assets/fonts/orbitron-bold.typeface.json?url';
import { neon } from '@/scene/materials/neon';

interface ChannelLettersProps {
  text: string;
  /** Cap height in world units. */
  size: number;
  /** How far the letters stick out (extrusion). */
  depth?: number;
  accent: string;
  glow?: number;
  lineHeight?: number;
  /** Receives the measured width/height, e.g. to size a backing board. */
  onMeasure?: (size: { width: number; height: number }) => void;
}

/**
 * Extruded "channel letter" signage: glowing faces (they bloom) on dark metal
 * returns. Centred on X/Y; the letters grow towards +Z from z = 0.
 */
export function ChannelLetters({
  text,
  size,
  depth = 0.12,
  accent,
  glow = 2.6,
  lineHeight = 1.25,
  onMeasure,
}: ChannelLettersProps) {
  // Text geometry groups: 0 = front/back faces, 1 = extruded sides.
  const materials = useMemo(
    () => [
      new MeshBasicMaterial({ color: neon(accent, glow), toneMapped: false }),
      new MeshStandardMaterial({
        color: '#1a1726',
        metalness: 0.7,
        roughness: 0.35,
        emissive: accent,
        emissiveIntensity: 0.12,
      }),
    ],
    [accent, glow],
  );

  // Stable callback (Center re-runs its layout effect when it changes) that only
  // reports real size changes, so callers can safely store it in state.
  const latestOnMeasure = useRef(onMeasure);
  latestOnMeasure.current = onMeasure;
  const lastSize = useRef('');
  const handleCentered = useCallback(({ width, height }: { width: number; height: number }) => {
    const key = `${width.toFixed(3)}x${height.toFixed(3)}`;
    if (key === lastSize.current) return;
    lastSize.current = key;
    latestOnMeasure.current?.({ width, height });
  }, []);

  return (
    <Center disableZ cacheKey={text} onCentered={handleCentered}>
      <Text3D
        font={signFont}
        size={size}
        height={depth}
        curveSegments={4}
        bevelEnabled
        bevelThickness={depth * 0.15}
        bevelSize={size * 0.012}
        bevelSegments={1}
        letterSpacing={size * 0.06}
        lineHeight={lineHeight}
        material={materials}
      >
        {text}
      </Text3D>
    </Center>
  );
}
