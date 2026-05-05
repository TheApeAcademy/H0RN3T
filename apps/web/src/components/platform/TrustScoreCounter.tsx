'use client'
import { useState, useCallback, useEffect } from 'react'
import { useTrustScoreAnimation, getScoreColor } from '@/hooks/useTrustScoreAnimation'

type AnimState = 'IDLE' | 'UPLOADING' | 'PROCESSING' | 'ANIMATING' | 'COMPLETE'

interface Props {
  score: number | null
  state: AnimState
  verdict: string | null
  onAnimationComplete?: () => void
}

export default function TrustScoreCounter({ score, state, verdict, onAnimationComplete }: Props) {
  const [displayScore, setDisplayScore] = useState(0)
  const [animComplete, setAnimComplete] = useState(false)

  const handleComplete = useCallback(() => {
    setAnimComplete(true)
    onAnimationComplete?.()
  }, [onAnimationComplete])

  const { registerSetter } = useTrustScoreAnimation({
    targetScore: score,
    state,
    onComplete: handleComplete,
  })

  useEffect(() => {
    registerSetter(setDisplayScore)
  }, [registerSetter])

  useEffect(() => {
    if (state !== 'ANIMATING') {
      setAnimComplete(false)
      setDisplayScore(0)
    }
  }, [state])

  const color = score !== null ? getScoreColor(score) : '#888'
  const displayColor = getScoreColor(displayScore)
  const circumference = 2 * Math.PI * 54
  const progress = score !== null ? displayScore / 100 : 0
  const dashOffset = circumference * (1 - progress)

  if (state === 'IDLE') return null

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Ring + Counter */}
      <div className="relative w-48 h-48 flex items-center justify-center">
        {/* Scanline overlay */}
        <div className="absolute inset-0 rounded-full scanline-overlay z-10 pointer-events-none" />

        {/* SVG Ring */}
        <svg
          className="absolute inset-0 -rotate-90"
          width="192"
          height="192"
          viewBox="0 0 120 120"
        >
          {/* Track */}
          <circle
            cx="60" cy="60" r="54"
            fill="none"
            stroke="#1E1E1E"
            strokeWidth="4"
          />
          {/* Progress */}
          <circle
            cx="60" cy="60" r="54"
            fill="none"
            stroke={displayColor}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{
              transition: 'stroke 0.3s ease',
              filter: `drop-shadow(0 0 8px ${displayColor}80)`,
            }}
          />
        </svg>

        {/* Score number */}
        <div className="relative z-20 text-center">
          {state === 'UPLOADING' && (
            <div className="font-mono text-sm text-hornet-dim animate-pulse">UPLOADING</div>
          )}
          {state === 'PROCESSING' && (
            <div className="font-mono text-sm text-hornet-gold animate-pulse">ANALYZING</div>
          )}
          {(state === 'ANIMATING' || state === 'COMPLETE') && (
            <>
              <div
                className="font-mono text-5xl font-bold tabular-nums"
                style={{
                  color: displayColor,
                  textShadow: `0 0 20px ${displayColor}80`,
                }}
              >
                {displayScore}
              </div>
              <div className="font-mono text-xs text-hornet-dim mt-1 tracking-widest">
                TRUST SCORE
              </div>
            </>
          )}
        </div>
      </div>

      {/* Verdict badge */}
      {(state === 'ANIMATING' || state === 'COMPLETE') && verdict && (
        <div
          className="px-4 py-1.5 rounded font-mono text-sm font-bold tracking-widest border"
          style={{
            color,
            borderColor: `${color}50`,
            backgroundColor: `${color}15`,
            boxShadow: animComplete ? `0 0 20px ${color}30` : 'none',
            transition: 'box-shadow 0.6s ease',
          }}
        >
          {verdict.replace(/_/g, ' ').toUpperCase()}
        </div>
      )}

      {/* Processing indicator */}
      {state === 'PROCESSING' && (
        <div className="flex items-center gap-2">
          <ProcessingDots />
          <span className="font-mono text-xs text-hornet-dim">Running deepfake analysis</span>
        </div>
      )}
    </div>
  )
}

function ProcessingDots() {
  return (
    <div className="flex gap-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-hornet-gold animate-pulse"
          style={{ animationDelay: `${i * 0.2}s` }}
        />
      ))}
    </div>
  )
}
