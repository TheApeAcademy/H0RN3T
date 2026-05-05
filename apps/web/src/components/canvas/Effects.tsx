'use client'
import { useSceneStore } from '@/stores/sceneStore'
import { EffectComposer, Bloom, ChromaticAberration, Vignette, DepthOfField } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'

export default function Effects() {
  const phase = useSceneStore((s) => s.phase)
  const isFlythrough = phase === 'FLYTHROUGH'

  return (
    <EffectComposer>
      <Bloom
        intensity={isFlythrough ? 2.5 : 1.0}
        luminanceThreshold={0.3}
        luminanceSmoothing={0.9}
        mipmapBlur
      />
      <ChromaticAberration
        offset={new THREE.Vector2(
          isFlythrough ? 0.004 : 0.001,
          isFlythrough ? 0.004 : 0.001
        )}
        blendFunction={BlendFunction.NORMAL}
        radialModulation={false}
        modulationOffset={0}
      />
      {phase === 'HIVE' && (
        <DepthOfField
          focusDistance={0.02}
          focalLength={0.1}
          bokehScale={2}
        />
      )}
      <Vignette
        eskil={false}
        offset={0.1}
        darkness={isFlythrough ? 0.9 : 0.5}
      />
    </EffectComposer>
  )
}
