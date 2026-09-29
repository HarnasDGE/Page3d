import { Color } from 'three';

/**
 * HDR colour for emissive / basic materials. Values above 1 cross the bloom
 * threshold, so only things built with this helper glow.
 * Use together with `toneMapped={false}`.
 */
export function neon(color: string, intensity = 2.2) {
  return new Color(color).multiplyScalar(intensity);
}
