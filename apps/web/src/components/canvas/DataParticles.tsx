'use client'
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface Props {
  count?: number
}

export default function DataParticles({ count = 600 }: Props) {
  const meshRef = useRef<THREE.InstancedMesh>(null)

  const { positions, speeds, offsets } = useMemo(() => {
    const positions: THREE.Vector3[] = []
    const speeds: number[] = []
    const offsets: number[] = []

    for (let i = 0; i < count; i++) {
      // Spherical distribution around hive
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = 4 + Math.random() * 8

      positions.push(new THREE.Vector3(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        -15 + r * Math.cos(phi) * 0.3
      ))
      speeds.push(0.3 + Math.random() * 0.7)
      offsets.push(Math.random() * Math.PI * 2)
    }

    return { positions, speeds, offsets }
  }, [count])

  const dummy = useMemo(() => new THREE.Object3D(), [])

  useFrame((state) => {
    if (!meshRef.current) return
    const t = state.clock.getElapsedTime()

    for (let i = 0; i < count; i++) {
      const pos = positions[i]
      const speed = speeds[i]
      const offset = offsets[i]

      // Orbit + drift
      const angle = t * speed * 0.2 + offset
      dummy.position.set(
        pos.x * Math.cos(angle * 0.3) - pos.y * Math.sin(angle * 0.3),
        pos.x * Math.sin(angle * 0.3) + pos.y * Math.cos(angle * 0.3),
        pos.z + Math.sin(t * speed + offset) * 0.5
      )

      // Scale pulse
      const s = 0.03 + Math.abs(Math.sin(t * speed * 2 + offset)) * 0.03
      dummy.scale.setScalar(s)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    }

    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      {/* Hex shape via cylinder */}
      <cylinderGeometry args={[1, 1, 0.3, 6]} />
      <meshStandardMaterial
        color="#FFD700"
        emissive="#FFD700"
        emissiveIntensity={2}
        transparent
        opacity={0.7}
      />
    </instancedMesh>
  )
}
