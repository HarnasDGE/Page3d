import type { WireSymbol } from './puzzle';

interface SymbolShapeProps {
  symbol: WireSymbol;
  size: number;
  color: string;
}

/** Flat geometric symbol (no font glyphs needed). */
export function SymbolShape({ symbol, size, color }: SymbolShapeProps) {
  const material = <meshBasicMaterial color={color} />;
  switch (symbol) {
    case 'circle':
      return (
        <mesh>
          <ringGeometry args={[size * 0.28, size * 0.5, 24]} />
          {material}
        </mesh>
      );
    case 'triangle':
      return (
        <mesh rotation-z={Math.PI / 2}>
          <circleGeometry args={[size * 0.55, 3]} />
          {material}
        </mesh>
      );
    case 'square':
      return (
        <mesh>
          <planeGeometry args={[size * 0.8, size * 0.8]} />
          {material}
        </mesh>
      );
    case 'diamond':
      return (
        <mesh rotation-z={Math.PI / 4}>
          <planeGeometry args={[size * 0.7, size * 0.7]} />
          {material}
        </mesh>
      );
  }
}
