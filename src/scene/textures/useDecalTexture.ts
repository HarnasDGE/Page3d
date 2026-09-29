import { useMemo } from 'react';
import { useTexture } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { RepeatWrapping, type Texture } from 'three';

interface Options {
  /** Tile the texture this many times (for floors). */
  repeat?: [number, number];
}

/**
 * Loads an SVG (or any image) as a texture with sharp filtering at grazing
 * angles. Textures are cached by URL, so reuse is free.
 */
export function useDecalTexture(url: string, { repeat }: Options = {}): Texture {
  const texture = useTexture(url);
  const maxAnisotropy = useThree((state) => state.gl.capabilities.getMaxAnisotropy());

  const [repeatX, repeatY] = repeat ?? [0, 0];

  return useMemo(() => {
    // Tiled textures get their own copy so the shared cached one stays untouched.
    const configured = repeatX ? texture.clone() : texture;
    configured.anisotropy = Math.min(8, maxAnisotropy);
    if (repeatX) {
      configured.wrapS = configured.wrapT = RepeatWrapping;
      configured.repeat.set(repeatX, repeatY);
    }
    configured.needsUpdate = true;
    return configured;
  }, [texture, maxAnisotropy, repeatX, repeatY]);
}
