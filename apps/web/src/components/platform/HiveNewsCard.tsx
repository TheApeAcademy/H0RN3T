'use client'
import BotBridge from './BotBridge'
import type { ThreatFeedItem } from '@/types/database'

interface Props {
  item: ThreatFeedItem
  compact?: boolean
}

export default function HiveNewsCard({ item, compact }: Props) {
  if (compact) {
    return (
      <div className="flex items-center gap-3 py-2.5 border-b border-hornet-border last:border-0">
        <SeverityDot severity={item.severity} />
        <div className="flex-1 min-w-0">
          <p className="font-mono text-xs text-hornet-text truncate">{item.title}</p>
          <p className="font-mono text-[10px] text-hornet-muted">{item.external_id}</p>
        </div>
        <span className="font-mono text-[10px] text-hornet-dim flex-shrink-0">
          {new Date(item.published_at).toLocaleDateString()}
        </span>
      </div>
    )
  }

  return (
    <div className="hornet-panel p-4">
      <div className="flex items-start gap-3 mb-3">
        <SeverityDot severity={item.severity} className="mt-1" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-mono text-xs font-bold text-hornet-gold">{item.external_id}</span>
            <SeverityBadge severity={item.severity} />
          </div>
          <h3 className="font-mono text-sm text-hornet-text">{item.title}</h3>
        </div>
      </div>

      {item.summary && (
        <p className="font-mono text-xs text-hornet-dim leading-relaxed mb-3 line-clamp-3">
          {item.summary}
        </p>
      )}

      <BotBridge
        type="threat_feed"
        feedItemId={item.id}
        feedItem={item}
        label="Investigate"
      />
    </div>
  )
}

function SeverityDot({ severity, className }: { severity: string; className?: string }) {
  const colors: Record<string, string> = {
    critical: 'bg-hornet-critical',
    high: 'bg-hornet-high',
    medium: 'bg-hornet-medium',
    low: 'bg-hornet-low',
    info: 'bg-hornet-info',
  }
  return (
    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${colors[severity] || colors.info} ${className || ''} ${severity === 'critical' ? 'animate-pulse' : ''}`} />
  )
}

function SeverityBadge({ severity }: { severity: string }) {
  const cls: Record<string, string> = {
    critical: 'severity-critical',
    high: 'severity-high',
    medium: 'severity-medium',
    low: 'severity-low',
    info: 'severity-info',
  }
  return (
    <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold tracking-wider ${cls[severity] || cls.info}`}>
      {severity.toUpperCase()}
    </span>
  )
}
