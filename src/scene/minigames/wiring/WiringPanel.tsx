import { useMemo, useState } from 'react';
import { Text } from '@react-three/drei';
import { CatmullRomCurve3, TubeGeometry, Vector3 } from 'three';
import { FONTS } from '@/scene/fonts';
import { neon } from '@/scene/materials/neon';
import { onTap } from '@/scene/world/events';
import { WIRE_COLORS, type WiringRound } from './puzzle';
import { SymbolShape } from './SymbolShape';

const WIRE_X = [-0.3, -0.1, 0.1, 0.3];
const TERMINAL_Y = 0.32;
const TAG_Y = -0.42;
const SOLVED_COLOR = '#1cff9e';

function createWireGeometry(x: number, index: number) {
  const sway = index % 2 === 0 ? 0.035 : -0.035;
  const curve = new CatmullRomCurve3([
    new Vector3(x, TERMINAL_Y, 0.02),
    new Vector3(x + sway, 0.05, 0.08),
    new Vector3(x - sway, -0.22, 0.07),
    new Vector3(x, TAG_Y + 0.06, 0.05),
  ]);
  return new TubeGeometry(curve, 24, 0.018, 8, false);
}

interface WiringPanelProps {
  round: WiringRound;
  isSolved: boolean;
  onPick: (index: number) => void;
}

/** Inside of the power box: LIVE sticker plus four tagged cables to choose from. */
export function WiringPanel({ round, isSolved, onPick }: WiringPanelProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const geometries = useMemo(() => WIRE_X.map((x, i) => createWireGeometry(x, i)), []);

  return (
    <group>
      {/* LIVE sticker: the symbol to look for. */}
      <group position={[0, 0.48, 0.02]}>
        <mesh>
          <planeGeometry args={[0.46, 0.14]} />
          <meshBasicMaterial color="#ffd400" />
        </mesh>
        <Text font={FONTS.display} position={[-0.08, 0, 0.005]} fontSize={0.06} anchorX="center" anchorY="middle">
          LIVE
          <meshBasicMaterial color="#111111" />
        </Text>
        <group position={[0.12, 0, 0.005]}>
          <SymbolShape symbol={round.live} size={0.1} color="#111111" />
        </group>
      </group>

      {WIRE_X.map((x, i) => {
        const color = isSolved && round.tags[i] === round.live ? SOLVED_COLOR : WIRE_COLORS[i];
        const glow = hovered === i ? 2.6 : 1.4;
        return (
          <group
            key={x}
            onClick={onTap(() => onPick(i))}
            onPointerOver={(event) => {
              event.stopPropagation();
              setHovered(i);
            }}
            onPointerOut={() => setHovered((current) => (current === i ? null : current))}
          >
            {/* Terminal screw */}
            <mesh position={[x, TERMINAL_Y, 0.02]}>
              <cylinderGeometry args={[0.035, 0.035, 0.03, 12]} />
              <meshStandardMaterial color="#b9bfcc" metalness={0.9} roughness={0.3} />
            </mesh>
            <mesh geometry={geometries[i]}>
              <meshBasicMaterial color={neon(color, glow)} toneMapped={false} />
            </mesh>
            {/* Tag with the symbol and a number for keyboard players. */}
            <group position={[x, TAG_Y, 0.06]}>
              <mesh>
                <planeGeometry args={[0.14, 0.2]} />
                <meshBasicMaterial color="#f2f2f2" />
              </mesh>
              <group position-y={0.035}>
                <SymbolShape symbol={round.tags[i]} size={0.09} color="#111111" />
              </group>
              <Text font={FONTS.display} position={[0, -0.06, 0.005]} fontSize={0.045} anchorX="center" anchorY="middle">
                {String(i + 1)}
                <meshBasicMaterial color="#555555" />
              </Text>
            </group>
            {/* Invisible, generous hit area per cable. */}
            <mesh position={[x, -0.05, 0.08]}>
              <boxGeometry args={[0.17, 0.95, 0.08]} />
              <meshBasicMaterial transparent opacity={0} depthWrite={false} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
