import { MeshStandardMaterial } from 'three';

const WINDOW_INTENSITY = 1.15;

/**
 * Building material with procedural lit windows driven by world position,
 * so any box (scaled or instanced) gets a consistent window grid for free.
 */
export function createFacadeMaterial(color: string) {
  const material = new MeshStandardMaterial({ color, roughness: 0.8, metalness: 0.1 });

  material.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
        varying vec3 vFacadePos;
        varying vec3 vFacadeNormal;`,
      )
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        mat4 facadeModel = modelMatrix;
        #ifdef USE_INSTANCING
          facadeModel = modelMatrix * instanceMatrix;
        #endif
        vFacadePos = (facadeModel * vec4(transformed, 1.0)).xyz;
        vFacadeNormal = normalize(mat3(facadeModel) * objectNormal);`,
      );

    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
        varying vec3 vFacadePos;
        varying vec3 vFacadeNormal;

        // Sin-free hash (Dave Hoskins): stable across GPUs, no per-pixel noise.
        float facadeHash(vec2 p) {
          vec3 p3 = fract(vec3(p.xyx) * 0.1031);
          p3 += dot(p3, p3.yzx + 33.33);
          return fract((p3.x + p3.y) * p3.z);
        }`,
      )
      .replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
        {
          vec3 facadeN = abs(vFacadeNormal);
          if (facadeN.y < 0.5) {
            float u = facadeN.x > 0.5 ? vFacadePos.z : vFacadePos.x;
            vec2 grid = vec2(u / 2.4, (vFacadePos.y - 1.0) / 3.2);
            vec2 cell = floor(grid);
            vec2 f = fract(grid);
            float pane = step(0.22, f.x) * step(f.x, 0.78) * step(0.28, f.y) * step(f.y, 0.72);
            float seed = facadeHash(cell + round(vFacadeNormal.xz) * 17.0);
            float lit = step(0.55, seed) * step(1.0, cell.y);
            float tint = fract(seed * 7.13);
            vec3 windowColor = tint < 0.5
              ? vec3(1.0, 0.6, 0.3)
              : (tint < 0.8 ? vec3(0.3, 0.85, 1.0) : vec3(1.0, 0.35, 0.8));
            diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.015, 0.012, 0.03), pane * step(1.0, cell.y));
            totalEmissiveRadiance += windowColor * pane * lit * ${WINDOW_INTENSITY.toFixed(2)};
          }
        }`,
      );
  };
  material.customProgramCacheKey = () => 'facade';

  return material;
}
