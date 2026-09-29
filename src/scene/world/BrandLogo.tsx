import { useMemo } from 'react';
import { Center, Text } from '@react-three/drei';
import { useLoader } from '@react-three/fiber';
import { Box3, DoubleSide, ShapeGeometry, Vector3, type BufferGeometry } from 'three';
import { SVGLoader, type StrokeStyle } from 'three/examples/jsm/loaders/SVGLoader.js';
import { FONTS } from '@/scene/fonts';
import { neon } from '@/scene/materials/neon';
import { NON_AGENCY_LOGO } from '@/scene/textures/assets';

interface BrandLogoProps {
  /** Target width in world units. */
  width: number;
  color: string;
  glow?: number;
}

/** Vector logo: every filled/stroked SVG path becomes flat neon geometry. */
function SvgLogo({ url, width, color, glow }: BrandLogoProps & { url: string }) {
  const svg = useLoader(SVGLoader, url);

  const { geometries, scale } = useMemo(() => {
    const result: BufferGeometry[] = [];
    for (const path of svg.paths) {
      const style = path.userData?.style as (StrokeStyle & { fill?: string; stroke?: string }) | undefined;
      if (!style) continue;
      if (style.fill !== 'none') {
        for (const shape of path.toShapes()) result.push(new ShapeGeometry(shape));
      }
      if (style.stroke && style.stroke !== 'none') {
        for (const subPath of path.subPaths) {
          const stroke = SVGLoader.pointsToStroke(subPath.getPoints(), style);
          if (stroke) result.push(stroke);
        }
      }
    }
    const bounds = new Box3();
    for (const geometry of result) {
      geometry.computeBoundingBox();
      if (geometry.boundingBox) bounds.union(geometry.boundingBox);
    }
    const size = bounds.getSize(new Vector3());
    return { geometries: result, scale: size.x > 0 ? width / size.x : 1 };
  }, [svg, width]);

  const material = <meshBasicMaterial color={neon(color, glow)} toneMapped={false} side={DoubleSide} />;

  return (
    <Center>
      {/* SVG's Y axis points down, so flip it. */}
      <group scale={[scale, -scale, scale]}>
        {geometries.map((geometry, i) => (
          <mesh key={i} geometry={geometry}>
            {material}
          </mesh>
        ))}
      </group>
    </Center>
  );
}

/**
 * NON.agency logo. Uses src/assets/svg/non-agency-logo.svg when present,
 * otherwise a neon wordmark placeholder.
 */
export function BrandLogo({ width, color, glow = 2.6 }: BrandLogoProps) {
  if (NON_AGENCY_LOGO) return <SvgLogo url={NON_AGENCY_LOGO} width={width} color={color} glow={glow} />;

  return (
    <Text
      font={FONTS.display}
      fontSize={width / 6.2}
      letterSpacing={0.04}
      anchorX="center"
      anchorY="middle"
    >
      NON.agency
      <meshBasicMaterial color={neon(color, glow)} toneMapped={false} />
    </Text>
  );
}
