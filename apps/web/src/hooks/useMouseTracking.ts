'use client'
import { useEffect } from 'react'
import { useSceneStore } from '@/stores/sceneStore'

export function useMouseTracking() {
  const setMouse = useSceneStore((s) => s.setMouse)

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      // Normalize to [-1, 1]
      const x = (e.clientX / window.innerWidth) * 2 - 1
      const y = -((e.clientY / window.innerHeight) * 2 - 1)
      setMouse(x, y)
    }

    window.addEventListener('mousemove', onMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMouseMove)
  }, [setMouse])
}
