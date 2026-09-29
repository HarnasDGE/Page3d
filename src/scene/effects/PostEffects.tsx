import { Bloom, EffectComposer, ToneMapping, Vignette } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import { useGameStore } from '@/scene/store/gameStore';

/** Bloom makes every HDR (`neon()`) colour glow; the rest stays crisp. */
export function PostEffects() {
  const quality = useGameStore((state) => state.quality);
  const isHigh = quality === 'high';

  return (
    <EffectComposer multisampling={isHigh ? 4 : 0}>
      <Bloom
        mipmapBlur
        luminanceThreshold={1}
        luminanceSmoothing={0.2}
        intensity={isHigh ? 1.1 : 0.8}
        levels={isHigh ? 7 : 5}
      />
      <Vignette offset={0.3} darkness={0.6} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
    </EffectComposer>
  );
}
