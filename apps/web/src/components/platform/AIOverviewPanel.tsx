'use client'
import { useEffect, useState } from 'react'
import BotBridge from './BotBridge'
import type { Scan } from '@/types/database'

interface Props {
  scan: Scan
  visible: boolean
}

export default function AIOverviewPanel({ scan, visible }: Props) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (visible) {
      const t = setTimeout(() => setMounted(true), 50)
      return () => clearTimeout(t)
    } else {
      setMounted(false)
    }
  }, [visible])

  const raw = scan.raw_analysis as Record<string, unknown> | null
  const keyFindings: string[] = raw?.key_findings as string[] || []
  const technicalIndicators: string[] = raw?.technical_indicators as string[] || []
  const recommendedActions: string[] = raw?.recommended_actions as string[] || []

  return (
    <div
      className="space-y-4 transition-all duration-500"
      style={{
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(20px)',
      }}
    >
      {/* AI Explanation */}
      <div className="hornet-panel p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-hornet-gold" />
          <h3 className="font-mono text-sm font-bold text-hornet-gold tracking-wider">
            AI FORENSIC ANALYSIS
          </h3>
        </div>
        <p className="font-mono text-sm text-hornet-text leading-relaxed">
          {scan.ai_explanation || 'Analysis pending...'}
        </p>
      </div>

      {/* Key Findings */}
      {keyFindings.length > 0 && (
        <div className="hornet-panel p-6">
          <h3 className="font-mono text-xs font-bold text-hornet-dim uppercase tracking-widest mb-3">
            Key Findings
          </h3>
          <ul className="space-y-2">
            {keyFindings.map((finding, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="font-mono text-hornet-gold text-xs mt-0.5 flex-shrink-0">▸</span>
                <span className="font-mono text-sm text-hornet-text">{finding}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Technical Indicators */}
      {technicalIndicators.length > 0 && (
        <div className="hornet-panel p-6">
          <h3 className="font-mono text-xs font-bold text-hornet-dim uppercase tracking-widest mb-3">
            Technical Indicators
          </h3>
          <div className="space-y-1.5">
            {technicalIndicators.map((indicator, i) => (
              <div key={i} className="flex items-center gap-2 py-1.5 border-b border-hornet-border last:border-0">
                <span className="font-mono text-[10px] text-hornet-dim tabular-nums w-5">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="font-mono text-xs text-hornet-text">{indicator}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Actions */}
      {recommendedActions.length > 0 && (
        <div className="hornet-panel p-6">
          <h3 className="font-mono text-xs font-bold text-hornet-dim uppercase tracking-widest mb-3">
            Recommended Actions
          </h3>
          <ol className="space-y-2">
            {recommendedActions.map((action, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="font-mono text-hornet-gold font-bold text-xs flex-shrink-0 mt-0.5">
                  {i + 1}.
                </span>
                <span className="font-mono text-sm text-hornet-text">{action}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Bot Bridge CTA */}
      <div
        className="transition-all duration-300"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(10px)',
          transitionDelay: '300ms',
        }}
      >
        <BotBridge
          type="eyes_scan"
          scanId={scan.id}
          label="Continue Investigation with HORNET BOT"
          context={{
            scan_name: scan.file_name,
            trust_score: scan.trust_score,
            verdict: scan.verdict,
          }}
        />
      </div>
    </div>
  )
}
