'use client'
import { useEffect, useRef } from 'react'
import { useSceneStore } from '@/stores/sceneStore'

// GSAP ScrollTrigger drives cameraZ through Zustand
// Camera path: z=5 (HERO) → z=-2 (inside hornet) → z=-10 (HIVE)
const CAMERA_KEYFRAMES = [
  { scroll: 0, z: 5, phase: 'HERO' as const },
  { scroll: 0.4, z: 0, phase: 'FLYTHROUGH' as const },
  { scroll: 0.7, z: -4, phase: 'FLYTHROUGH' as const },
  { scroll: 1.0, z: -10, phase: 'HIVE' as const },
]

export function useScrollCamera(proxyRef: React.RefObject<HTMLDivElement>) {
  const setCameraZ = useSceneStore((s) => s.setCameraZ)
  const setScrollProgress = useSceneStore((s) => s.setScrollProgress)
  const setPhase = useSceneStore((s) => s.setPhase)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const proxy = proxyRef.current
    if (!proxy) return

    function lerp(a: number, b: number, t: number) {
      return a + (b - a) * t
    }

    function getCameraZ(progress: number): number {
      for (let i = 0; i < CAMERA_KEYFRAMES.length - 1; i++) {
        const a = CAMERA_KEYFRAMES[i]
        const b = CAMERA_KEYFRAMES[i + 1]
        if (progress >= a.scroll && progress <= b.scroll) {
          const t = (progress - a.scroll) / (b.scroll - a.scroll)
          return lerp(a.z, b.z, easeInOutCubic(t))
        }
      }
      return CAMERA_KEYFRAMES[CAMERA_KEYFRAMES.length - 1].z
    }

    function getPhase(progress: number) {
      if (progress < 0.05) return 'HERO' as const
      if (progress < 0.65) return 'FLYTHROUGH' as const
      return 'HIVE' as const
    }

    function onScroll() {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(() => {
        const maxScroll = proxy.scrollHeight - proxy.clientHeight
        const progress = maxScroll > 0 ? proxy.scrollTop / maxScroll : 0
        setScrollProgress(progress)
        setCameraZ(getCameraZ(progress))
        setPhase(getPhase(progress))
      })
    }

    proxy.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      proxy.removeEventListener('scroll', onScroll)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [proxyRef, setCameraZ, setScrollProgress, setPhase])
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}
