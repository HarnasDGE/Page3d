import { useState } from 'react';
import { neon } from '@/scene/materials/neon';
import { ChannelLetters } from './ChannelLetters';

/** Gap between the wall and the sign's backing box. */
const STANDOFF = 0.45;
const BOX_DEPTH = 0.22;
const PADDING = 0.6;
const STEEL = { color: '#2a2640', metalness: 0.85, roughness: 0.35 } as const;

interface WallSignProps {
  text: string;
  accent: string;
  /** Letter height. */
  size?: number;
}

/**
 * Shop sign that projects from the facade: a dark backing box held off the wall
 * by steel brackets, with extruded neon letters on the front. Local frame:
 * the wall is the z = 0 plane, the street is towards +Z.
 */
export function WallSign({ text, accent, size = 0.62 }: WallSignProps) {
  const [measured, setMeasured] = useState({ width: text.length * size * 0.9, height: size });
  const width = Math.max(measured.width + PADDING * 2, 3.2);
  const height = measured.height + PADDING;
  const bracketX = width / 2 - 0.5;

  return (
    <group>
      {/* Brackets from the wall to the box, top and bottom on both sides. */}
      {[-bracketX, bracketX].flatMap((x) =>
        [-1, 1].map((row) => (
          <mesh key={`${x}:${row}`} position={[x, (row * height) / 3, STANDOFF / 2]}>
            <boxGeometry args={[0.08, 0.08, STANDOFF]} />
            <meshStandardMaterial {...STEEL} />
          </mesh>
        )),
      )}

      <group position-z={STANDOFF + BOX_DEPTH / 2}>
        <mesh>
          <boxGeometry args={[width, height, BOX_DEPTH]} />
          <meshStandardMaterial color="#0b0916" metalness={0.6} roughness={0.4} />
        </mesh>
        {/* Neon trim along the bottom edge. */}
        <mesh position={[0, -height / 2, BOX_DEPTH / 2]}>
          <boxGeometry args={[width, 0.05, 0.05]} />
          <meshBasicMaterial color={neon(accent, 2)} toneMapped={false} />
        </mesh>
        <group position-z={BOX_DEPTH / 2}>
          <ChannelLetters text={text} size={size} accent={accent} onMeasure={setMeasured} />
        </group>
      </group>
    </group>
  );
}
