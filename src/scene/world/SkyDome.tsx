import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { BackSide, Color, ShaderMaterial, type Mesh } from 'three';

export const HORIZON_COLOR = '#2a1250';
const ZENITH_COLOR = '#04030a';

/** Gradient night sky with a smoggy neon glow near the horizon. */
export function SkyDome() {
  const dome = useRef<Mesh>(null);

  // Keep the dome centred on the camera so it never gets clipped.
  useFrame(({ camera }) => dome.current?.position.copy(camera.position));

  const material = useMemo(
    () =>
      new ShaderMaterial({
        side: BackSide,
        depthWrite: false,
        fog: false,
        uniforms: {
          uHorizon: { value: new Color(HORIZON_COLOR) },
          uZenith: { value: new Color(ZENITH_COLOR) },
        },
        vertexShader: /* glsl */ `
          varying vec3 vDirection;
          void main() {
            vDirection = normalize(position);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          uniform vec3 uHorizon;
          uniform vec3 uZenith;
          varying vec3 vDirection;
          void main() {
            float h = clamp(vDirection.y, 0.0, 1.0);
            gl_FragColor = vec4(mix(uHorizon, uZenith, pow(h, 0.45)), 1.0);
          }
        `,
      }),
    [],
  );

  return (
    <mesh ref={dome} material={material} renderOrder={-1} frustumCulled={false}>
      <sphereGeometry args={[240, 32, 16]} />
    </mesh>
  );
}
