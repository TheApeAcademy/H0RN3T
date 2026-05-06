'use client'
import { useState } from 'react'
import BotBridge from './BotBridge'
import type { ThreatFeedItem } from '@/types/database'
import clsx from 'clsx'

interface Props {
  item: ThreatFeedItem
}

const SEVERITY_CONFIG = {
  critical: { label: 'CRITICAL', class: 'severity-critical', dot: 'bg-hornet-critical' },
  high: { label: 'HIGH', class: 'severity-high', dot: 'bg-hornet-high' },
  medium: { label: 'MEDIUM', class: 'severity-medium', dot: 'bg-hornet-medium' },
  low: { label: 'LOW', class: 'severity-low', dot: 'bg-hornet-low' },
  info: { label: 'INFO', class: 'severity-info', dot: 'bg-hornet-info' },
}

export default function CVECard({ item }: Props) {
  const [expanded, setExpanded] = useState(false)
  const severity = SEVERITY_CONFIG[item.severity] || SEVERITY_CONFIG.info

  return (
    <div className={clsx(
      'hornet-panel transition-all duration-200',
      item.severity === 'critical' && 'border-red-900/50 shadow-[0_0_20px_rgba(255,34,34,0.1)]',
      item.severity === 'high' && 'border-orange-900/30',
    )}>
      {/* Header */}
      <div
        className="px-5 py-4 cursor-pointer flex items-start gap-4"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Severity indicator */}
        <div className="flex-shrink-0 pt-0.5">
          <div className={clsx('w-2 h-2 rounded-full mt-1', severity.dot,
            item.severity === 'critical' && 'animate-pulse'
          )} />
        </div>

        <div className="flex-1 min-w-0">
          {/* ID + severity */}
          <div className="flex items-center gap-3 flex-wrap mb-1.5">
            <span className="font-mono text-xs font-bold text-hornet-gold">
              {item.external_id}
            </span>
            <span className={clsx('px-2 py-0.5 rounded font-mono text-[10px] font-bold tracking-wider', severity.class)}>
              {severity.label}
            </span>
            {item.cvss_score !== null && (
              <span className="font-mono text-[10px] text-hornet-dim">
                CVSS {item.cvss_score.toFixed(1)}
              </span>
            )}
            <span className="font-mono text-[10px] text-hornet-muted uppercase">
              {item.source}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-mono text-sm text-hornet-text leading-snug">
            {item.title}
          </h3>

          {/* Summary preview */}
          {item.summary && !expanded && (
            <p className="font-mono text-xs text-hornet-dim mt-2 line-clamp-2 leading-relaxed">
              {item.summary}
            </p>
          )}
        </div>

        {/* Expand icon + date */}
        <div className="flex-shrink-0 flex flex-col items-end gap-2">
          <span className="font-mono text-[10px] text-hornet-muted">
            {new Date(item.published_at).toLocaleDateString()}
          </span>
          <svg
            className={clsx('w-4 h-4 text-hornet-muted transition-transform', expanded && 'rotate-180')}
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-hornet-border px-5 py-4 space-y-4">
          {/* Full description */}
          <div>
            <h4 className="font-mono text-[10px] text-hornet-dim uppercase tracking-widest mb-2">
              Description
            </h4>
            <p className="font-mono text-xs text-hornet-text leading-relaxed">
              {item.description}
            </p>
          </div>

          {/* AI Summary */}
          {item.summary && (
            <div className="bg-hornet-gold/5 border border-hornet-gold/20 rounded p-3">
              <h4 className="font-mono text-[10px] text-hornet-gold uppercase tracking-widest mb-2">
                HORNET AI Summary
              </h4>
              <p className="font-mono text-xs text-hornet-text leading-relaxed">
                {item.summary}
              </p>
            </div>
          )}

          {/* Affected products */}
          {item.affected_products && Array.isArray(item.affected_products) && item.affected_products.length > 0 && (
            <div>
              <h4 className="font-mono text-[10px] text-hornet-dim uppercase tracking-widest mb-2">
                Affected Products
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {(item.affected_products as string[]).map((p, i) => (
                  <span key={i} className="px-2 py-0.5 bg-hornet-dark border border-hornet-border rounded font-mono text-[10px] text-hornet-dim">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* References */}
          {item.references && Array.isArray(item.references) && item.references.length > 0 && (
            <div>
              <h4 className="font-mono text-[10px] text-hornet-dim uppercase tracking-widest mb-2">
                References
              </h4>
              <ul className="space-y-1">
                {(item.references as string[]).slice(0, 3).map((ref, i) => (
                  <li key={i}>
                    <a
                      href={ref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-[11px] text-hornet-gold hover:underline truncate block"
                    >
                      {ref}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Bot Bridge */}
          <BotBridge
            type="threat_feed"
            feedItemId={item.id}
            feedItem={item}
            label={`Investigate ${item.external_id} with HORNET BOT`}
          />
        </div>
      )}
    </div>
  )
}
