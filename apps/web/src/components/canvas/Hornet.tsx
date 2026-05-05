'use client'
import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { useSceneStore } from '@/stores/sceneStore'

export default function HornetModel() {
  const groupRef = useRef<THREE.Group>(null)
  const mouseX = useSceneStore((s) => s.mouseX)
  const mouseY = useSceneStore((s) => s.mouseY)
  const phase = useSceneStore((s) => s.phase)

  let gltf: ReturnType<typeof useGLTF> | null = null
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    gltf = useGLTF('/models/hornet_main.glb')
  } catch {
    gltf = null
  }

  // Apply HORNET materials when model loads
  useEffect(() => {
    if (!gltf?.scene) return

    gltf.scene.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return

      const name = child.name.toLowerCase()

      if (name.includes('wing')) {
        child.material = new THREE.MeshPhysicalMaterial({
          transmission: 0.8,
          ior: 1.5,
          roughness: 0.05,
          metalness: 0,
          thickness: 0.2,
          color: new THREE.Color('#CCDDFF'),
          transparent: true,
          opacity: 0.7,
        })
      } else {
        child.material = new THREE.MeshPhysicalMaterial({
          metalness: 1,
          roughness: 0.05,
          clearcoat: 1,
          clearcoatRoughness: 0.1,
          color: new THREE.Color('#1A1A1A'),
          sheenColor: new THREE.Color('#FFD700'),
          sheen: 0.5,
          envMapIntensity: 2,
        })
      }
    })
  }, [gltf?.scene])

  useFrame((state) => {
    if (!groupRef.current) return
    const t = state.clock.getElapsedTime()

    // Hover float
    groupRef.current.position.y = Math.sin(t * 0.8) * 0.08

    // Head tracking — smooth rotation toward mouse
    const targetRotX = mouseY * 0.3
    const targetRotY = mouseX * 0.4
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, 0.05)
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, 0.05)

    // Wing flap — subtle
    if (gltf?.scene) {
      gltf.scene.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return
        if (child.name.toLowerCase().includes('wing')) {
          child.rotation.z = Math.sin(t * 15) * 0.05
        }
      })
    }

    // Scale up when entering HERO phase
    const targetScale = phase === 'INTRO' ? 0.01 : 1
    const currentScale = groupRef.current.scale.x
    groupRef.current.scale.setScalar(
      THREE.MathUtils.lerp(currentScale, targetScale, 0.04)
    )
  })

  if (!gltf?.scene) {
    return <HornetFallback groupRef={groupRef} />
  }

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <primitive object={gltf.scene} scale={1} />
    </group>
  )
}

// Procedural fallback when no GLB is provided
function HornetFallback({ groupRef }: { groupRef: React.RefObject<THREE.Group | null> }) {
  const mouseX = useSceneStore((s) => s.mouseX)
  const mouseY = useSceneStore((s) => s.mouseY)
  const phase = useSceneStore((s) => s.phase)

  useFrame((state) => {
    if (!groupRef.current) return
    const t = state.clock.getElapsedTime()
    groupRef.current.position.y = Math.sin(t * 0.8) * 0.08
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, mouseY * 0.3, 0.05)
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, mouseX * 0.4, 0.05)
    const targetScale = phase === 'INTRO' ? 0.01 : 1
    groupRef.current.scale.setScalar(THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, 0.04))
  })

  const bodyMat = new THREE.MeshPhysicalMaterial({
    metalness: 1, roughness: 0.05, clearcoat: 1,
    color: new THREE.Color('#1A1A1A'),
    sheenColor: new THREE.Color('#FFD700'), sheen: 0.5,
  })

  return (
    <group ref={groupRef}>
      {/* Body */}
      <mesh material={bodyMat}>
        <capsuleGeometry args={[0.25, 0.8, 8, 16]} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.7, 0]} material={bodyMat}>
        <sphereGeometry args={[0.22, 16, 16]} />
      </mesh>
      {/* Wings */}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 0.7, 0.2, 0]} rotation={[0, 0, side * 0.3]}>
          <planeGeometry args={[1.2, 0.5]} />
          <meshPhysicalMaterial
            transmission={0.8} ior={1.5} roughness={0.05}
            color="#AABBFF" transparent opacity={0.6} side={THREE.DoubleSide}
          />
        </mesh>
      ))}
      {/* Stinger */}
      <mesh position={[0, -0.7, 0]} rotation={[0, 0, Math.PI]}>
        <coneGeometry args={[0.06, 0.4, 8]} />
        <meshStandardMaterial color="#FFD700" metalness={1} roughness={0.2} />
      </mesh>
      {/* Eyes */}
      {[-0.08, 0.08].map((x) => (
        <mesh key={x} position={[x, 0.72, 0.18]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={2} />
        </mesh>
      ))}
    </group>
  )
}
