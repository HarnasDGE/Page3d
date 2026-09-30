import { useState } from 'react';
import { ChannelLetters } from './ChannelLetters';

const BLADE_THICKNESS = 0.3;
const BLADE_WIDTH = 1.4;
/** Distance from the wall to the blade's inner edge. */
const WALL_GAP = 0.3;
const STEEL = { color: '#2a2640', metalness: 0.85, roughness: 0.35 } as const;

interface BladeSignProps {
  word: string;
  accent: string;
  size?: number;
}

/**
 * Vertical sign sticking straight out of the wall (perpendicular to it) with
 * stacked 3D letters on both faces. Local frame: wall at z = 0, street +Z,
 * origin at the vertical centre of the sign.
 */
export function BladeSign({ word, accent, size = 0.6 }: BladeSignProps) {
  const vertical = word.split('').join('\n');
  const [measured, setMeasured] = useState({ width: size, height: word.length * size * 1.25 });
  const height = measured.height + 0.8;
  const centerZ = WALL_GAP + BLADE_WIDTH / 2;

  return (
    <group>
      {/* Top and bottom arms fixing the blade to the wall. */}
      {[-1, 1].map((row) => (
        <mesh key={row} position={[0, (row * height) / 2 - row * 0.25, WALL_GAP / 2 + 0.2]}>
          <boxGeometry args={[0.08, 0.08, WALL_GAP + 0.4]} />
          <meshStandardMaterial {...STEEL} />
        </mesh>
      ))}

      <group position-z={centerZ}>
        <mesh>
          <boxGeometry args={[BLADE_THICKNESS, height, BLADE_WIDTH]} />
          <meshStandardMaterial color="#0b0916" metalness={0.6} roughness={0.4} />
        </mesh>
        {/* Letters on both faces, readable from either end of the street. */}
        {[1, -1].map((side) => (
          <group key={side} position-x={(side * BLADE_THICKNESS) / 2} rotation-y={(side * Math.PI) / 2}>
            <ChannelLetters
              text={vertical}
              size={size}
              depth={0.1}
              accent={accent}
              lineHeight={1.25}
              onMeasure={side > 0 ? setMeasured : undefined}
            />
          </group>
        ))}
      </group>
    </group>
  );
}
