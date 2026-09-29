import type { ReactNode } from 'react';
import { Text } from '@react-three/drei';
import { FONTS } from '@/scene/fonts';
import { neon } from '@/scene/materials/neon';

export const PANEL_PADDING = 0.45;
const BORDER = 0.05;

interface HoloPanelProps {
  position: [number, number, number];
  rotationY?: number;
  width: number;
  height: number;
  accent: string;
  title?: string;
  /** Content laid out from the top-left corner below the title (local units). */
  children?: ReactNode;
}

/** Wall-mounted holographic screen with a neon frame and optional title. */
export function HoloPanel({ position, rotationY = 0, width, height, accent, title, children }: HoloPanelProps) {
  const frame = neon(accent, 1.8);
  const left = -width / 2 + PANEL_PADDING;
  const top = height / 2 - PANEL_PADDING;
  const edges: { position: [number, number, number]; size: [number, number, number] }[] = [
    { position: [0, height / 2, 0], size: [width + BORDER, BORDER, BORDER] },
    { position: [0, -height / 2, 0], size: [width + BORDER, BORDER, BORDER] },
    { position: [-width / 2, 0, 0], size: [BORDER, height, BORDER] },
    { position: [width / 2, 0, 0], size: [BORDER, height, BORDER] },
  ];

  return (
    <group position={position} rotation-y={rotationY}>
      <mesh>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial color="#0a0818" transparent opacity={0.85} metalness={0.5} roughness={0.4} />
      </mesh>
      {edges.map(({ position: edge, size }) => (
        <mesh key={edge.join()} position={edge}>
          <boxGeometry args={size} />
          <meshBasicMaterial color={frame} toneMapped={false} />
        </mesh>
      ))}

      <group position={[left, top, 0.02]}>
        {title && (
          <Text
            font={FONTS.display}
            fontSize={0.32}
            letterSpacing={0.14}
            anchorX="left"
            anchorY="top"
            maxWidth={width - PANEL_PADDING * 2}
          >
            {title}
            <meshBasicMaterial color={neon(accent, 2.2)} toneMapped={false} />
          </Text>
        )}
        <group position-y={title ? -0.7 : 0}>{children}</group>
      </group>
    </group>
  );
}

interface PanelTextProps {
  children: string;
  y?: number;
  x?: number;
  size?: number;
  maxWidth?: number;
  color?: string;
  font?: 'body' | 'display';
  glow?: number;
}

/** Left/top anchored text line or paragraph inside a HoloPanel. */
export function PanelText({
  children,
  x = 0,
  y = 0,
  size = 0.3,
  maxWidth,
  color = '#e6e3ff',
  font = 'body',
  glow = 1,
}: PanelTextProps) {
  return (
    <Text
      font={FONTS[font]}
      position={[x, y, 0]}
      fontSize={size}
      lineHeight={1.3}
      anchorX="left"
      anchorY="top"
      maxWidth={maxWidth}
    >
      {children}
      <meshBasicMaterial color={neon(color, glow)} toneMapped={false} />
    </Text>
  );
}
