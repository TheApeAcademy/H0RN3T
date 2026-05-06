'use client'
import { useEffect, useRef, useCallback } from 'react'

type AnimState = 'IDLE' | 'UPLOADING' | 'PROCESSING' | 'ANIMATING' | 'COMPLETE'

interface Options {
  targetScore: number | null
  state: AnimState
  onComplete?: () => void
}

export function useTrustScoreAnimation({ targetScore, state, onComplete }: Options) {
  const displayRef = useRef<number>(0)
  const rafRef = useRef<number | null>(null)
  const startTimeRef = useRef<number>(0)
  const setDisplayRef = useRef<((v: number) => void) | null>(null)

  const animate = useCallback(() => {
    if (targetScore === null) return
    const TOTAL_DURATION = 2200

    function tick(now: number) {
      const elapsed = now - startTimeRef.current
      const progress = Math.min(elapsed / TOTAL_DURATION, 1)

      let value: number
      if (progress < 0.364) {
        // Phase 1: 0–800ms easeOutCubic → 0 to 70%
        const t = progress / 0.364
        value = targetScore * 0.7 * easeOutCubic(t)
      } else if (progress < 0.818) {
        // Phase 2: 800–1800ms easeOutQuart → 70% to 95%
        const t = (progress - 0.364) / 0.454
        value = targetScore * (0.7 + 0.25 * easeOutQuart(t))
      } else {
        // Phase 3: 1800–2200ms easeInOutSine → 95% to 100%
        const t = (progress - 0.818) / 0.182
        value = targetScore * (0.95 + 0.05 * easeInOutSine(t))
      }

      displayRef.current = Math.round(value)
      setDisplayRef.current?.(displayRef.current)

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        displayRef.current = targetScore
        setDisplayRef.current?.(targetScore)
        onComplete?.()
      }
    }

    startTimeRef.current = performance.now()
    rafRef.current = requestAnimationFrame(tick)
  }, [targetScore, onComplete])

  useEffect(() => {
    if (state === 'ANIMATING' && targetScore !== null) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      animate()
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [state, targetScore, animate])

  const registerSetter = useCallback((fn: (v: number) => void) => {
    setDisplayRef.current = fn
  }, [])

  return { displayRef, registerSetter }
}

export function getScoreColor(score: number): string {
  if (score < 40) return 'hsl(0, 85%, 55%)'
  if (score < 70) return 'hsl(38, 92%, 50%)'
  if (score < 90) return 'hsl(52, 100%, 50%)'
  return 'hsl(142, 76%, 45%)'
}

function easeOutCubic(t: number) { return 1 - Math.pow(1 - t, 3) }
function easeOutQuart(t: number) { return 1 - Math.pow(1 - t, 4) }
function easeInOutSine(t: number) { return -(Math.cos(Math.PI * t) - 1) / 2 }
