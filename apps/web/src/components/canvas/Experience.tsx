'use client'
import { Canvas } from '@react-three/fiber'
import { Suspense, useRef } from 'react'
import { PerspectiveCamera } from '@react-three/drei'
import { useSceneStore } from '@/stores/sceneStore'
import { useMouseTracking } from '@/hooks/useMouseTracking'
import { useScrollCamera } from '@/hooks/useScrollCamera'
import HornetModel from './Hornet'
import HiveScene from './Hive'
import DataParticles from './DataParticles'
import Effects from './Effects'
import Typewriter from '@/components/landing/Typewriter'
import HUD from '@/components/landing/HUD'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function CameraRig() {
  const cameraZTarget = useSceneStore((s) => s.cameraZ)
  const cameraRef = useRef<THREE.PerspectiveCamera>(null)

  useFrame(() => {
    if (!cameraRef.current) return
    cameraRef.current.position.z = THREE.MathUtils.lerp(
      cameraRef.current.position.z,
      cameraZTarget,
      0.05
    )
  })

  return (
    <PerspectiveCamera
      ref={cameraRef}
      makeDefault
      position={[0, 0, 5]}
      fov={60}
      near={0.1}
      far={100}
    />
  )
}

function Scene() {
  const phase = useSceneStore((s) => s.phase)

  return (
    <>
      <CameraRig />

      {/* Lighting */}
      <ambientLight intensity={0.1} />
      <pointLight position={[0, 5, 5]} intensity={1.5} color="#FFD700" />
      <pointLight position={[-5, -3, 2]} intensity={0.8} color="#FF8C00" />
      <pointLight position={[5, 3, 1]} intensity={0.5} color="#FFFFFF" />

      {/* Hornet model — visible in INTRO/HERO/FLYTHROUGH */}
      {phase !== 'HIVE' && (
        <Suspense fallback={null}>
          <HornetModel />
        </Suspense>
      )}

      {/* Hive scene — visible from FLYTHROUGH onward */}
      {(phase === 'FLYTHROUGH' || phase === 'HIVE') && (
        <Suspense fallback={null}>
          <HiveScene />
          <DataParticles count={600} />
        </Suspense>
      )}

      <Effects />
    </>
  )
}

export default function Experience() {
  const scrollProxyRef = useRef<HTMLDivElement>(null)

  useMouseTracking()
  useScrollCamera(scrollProxyRef as React.RefObject<HTMLDivElement>)

  return (
    <div className="relative w-full h-screen">
      {/* R3F Canvas */}
      <Canvas
        className="absolute inset-0"
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['#0A0A0A']} />
        <fog attach="fog" args={['#0A0A0A', 20, 80]} />
        <Scene />
      </Canvas>

      {/* HTML overlay */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <Typewriter />
        <HUD />
      </div>

      {/* Scroll proxy */}
      <div
        ref={scrollProxyRef}
        className="absolute inset-0 overflow-y-scroll pointer-events-auto opacity-0"
        aria-hidden="true"
        style={{ scrollbarWidth: 'none' }}
      >
        <div style={{ height: '400vh' }} />
      </div>
    </div>
  )
}
