'use client'
import { useSceneStore } from '@/stores/sceneStore'
import Link from 'next/link'

const PHASE_LABELS: Record<string, string> = {
  INTRO: '// INITIALIZING',
  HERO: '// OPERATIVE ONLINE',
  FLYTHROUGH: '// PENETRATING NETWORK',
  HIVE: '// HIVE CORE ACCESS',
}

export default function HUD() {
  const phase = useSceneStore((s) => s.phase)
  const scrollProgress = useSceneStore((s) => s.scrollProgress)
  const introComplete = useSceneStore((s) => s.introComplete)

  if (!introComplete) return null

  const hiveVisible = phase === 'HIVE'
  const hiveOpacity = scrollProgress > 0.8 ? (scrollProgress - 0.8) / 0.2 : 0

  return (
    <>
      {/* Top-left phase label */}
      <div className="absolute top-6 left-6 pointer-events-none">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-hornet-gold animate-pulse" />
          <span className="font-mono text-[11px] text-hornet-gold/70 tracking-widest">
            {PHASE_LABELS[phase] || ''}
          </span>
        </div>
      </div>

      {/* Top-right scroll indicator */}
      <div className="absolute top-6 right-6 pointer-events-none">
        <div className="flex items-center gap-2">
          <div className="w-16 h-0.5 bg-hornet-border rounded-full overflow-hidden">
            <div
              className="h-full bg-hornet-gold transition-all duration-100"
              style={{ width: `${scrollProgress * 100}%` }}
            />
          </div>
          <span className="font-mono text-[10px] text-hornet-muted tabular-nums w-8">
            {Math.round(scrollProgress * 100)}%
          </span>
        </div>
      </div>

      {/* Hive section overlay */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
        style={{ opacity: hiveOpacity, transition: 'opacity 0.3s ease' }}
      >
        <div className="text-center space-y-4 pointer-events-auto">
          <h2 className="font-mono text-3xl font-bold text-hornet-gold gold-glow tracking-[0.2em]">
            THE HIVE
          </h2>
          <p className="font-mono text-sm text-hornet-dim tracking-widest">
            Live Threat Intelligence Network
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
            <Link href="/login" className="hornet-btn tracking-widest">
              ENTER THE HIVE →
            </Link>
          </div>
        </div>
      </div>

      {/* Corner decorations */}
      <div className="absolute top-0 left-0 w-16 h-16 pointer-events-none">
        <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-hornet-gold/20" />
      </div>
      <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none">
        <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-hornet-gold/20" />
      </div>
      <div className="absolute bottom-0 left-0 w-16 h-16 pointer-events-none">
        <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-hornet-gold/20" />
      </div>
      <div className="absolute bottom-0 right-0 w-16 h-16 pointer-events-none">
        <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-hornet-gold/20" />
      </div>
    </>
  )
}
