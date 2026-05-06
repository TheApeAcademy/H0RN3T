'use client'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

export default function HiveScene() {
  const groupRef = useRef<THREE.Group>(null)

  let gltf: ReturnType<typeof useGLTF> | null = null
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    gltf = useGLTF('/models/hive_core.glb')
  } catch {
    gltf = null
  }

  useFrame((state) => {
    if (!groupRef.current) return
    groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.1
  })

  if (!gltf?.scene) {
    return <HiveFallback groupRef={groupRef} />
  }

  return (
    <group ref={groupRef} position={[0, 0, -15]}>
      <primitive object={gltf.scene} scale={3} />
    </group>
  )
}

function HiveFallback({ groupRef }: { groupRef: React.RefObject<THREE.Group | null> }) {
  useFrame((state) => {
    if (!groupRef.current) return
    groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.1
  })

  // Hex grid of cells
  const hexes: [number, number, number][] = []
  const radius = 3
  for (let q = -radius; q <= radius; q++) {
    for (let r = Math.max(-radius, -q - radius); r <= Math.min(radius, -q + radius); r++) {
      const x = 0.9 * (q + r * 0.5)
      const y = 0.78 * r
      hexes.push([x, y, 0])
    }
  }

  const mat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#1A1200'),
    emissive: new THREE.Color('#FFD700'),
    emissiveIntensity: 0.15,
    metalness: 0.8,
    roughness: 0.3,
    wireframe: false,
  })

  return (
    <group ref={groupRef} position={[0, 0, -15]}>
      {hexes.map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]}>
          <cylinderGeometry args={[0.42, 0.42, 0.1, 6]} />
          <primitive object={mat} />
        </mesh>
      ))}
      {/* Core glow orb */}
      <mesh position={[0, 0, 0.5]}>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshStandardMaterial
          color="#FFD700"
          emissive="#FF8C00"
          emissiveIntensity={3}
          transparent
          opacity={0.6}
        />
      </mesh>
      <pointLight position={[0, 0, 1]} intensity={3} color="#FFD700" distance={10} />
    </group>
  )
}
