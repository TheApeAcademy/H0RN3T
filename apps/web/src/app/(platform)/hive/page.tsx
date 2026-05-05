'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import CVECard from '@/components/platform/CVECard'
import type { ThreatFeedItem } from '@/types/database'

const SEVERITY_FILTERS = ['all', 'critical', 'high', 'medium', 'low', 'info'] as const

export default function HivePage() {
  const [items, setItems] = useState<ThreatFeedItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [severity, setSeverity] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ id: string; item: ThreatFeedItem } | null>(null)
  const [digest, setDigest] = useState<string | null>(null)
  const supabase = createClient()

  const fetchFeed = useCallback(async (p = 1, sev = severity) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(p) })
      if (sev !== 'all') params.set('severity', sev)
      const res = await fetch(`/api/threat-feed?${params}`)
      const data = await res.json()
      setItems(data.items || [])
      setTotal(data.total || 0)
      setPages(data.pages || 1)
    } finally {
      setLoading(false)
    }
  }, [severity])

  useEffect(() => {
    fetchFeed(page, severity)
  }, [page, severity, fetchFeed])

  // Realtime subscription for new critical items
  useEffect(() => {
    const channel = supabase
      .channel('threat-feed-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'threat_feed_items' },
        (payload) => {
          const newItem = payload.new as ThreatFeedItem
          if (newItem.severity === 'critical' || newItem.severity === 'high') {
            setToast({ id: crypto.randomUUID(), item: newItem })
            setTimeout(() => setToast(null), 8000)
          }
          // Prepend to feed if on page 1
          if (page === 1) {
            setItems((prev) => [newItem, ...prev.slice(0, 19)])
          }
        }
      )
      .subscribe()

    return () => { channel.unsubscribe() }
  }, [supabase, page])

  function handleSeverityChange(sev: string) {
    setSeverity(sev)
    setPage(1)
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Realtime toast */}
      {toast && (
        <div
          className="fixed top-6 right-6 z-50 max-w-sm hornet-panel border-red-900/50 p-4 shadow-panel
                     animate-slide-in flex items-start gap-3"
          style={{ borderColor: 'rgba(239,68,68,0.5)' }}
        >
          <div className="w-2 h-2 rounded-full bg-hornet-critical animate-pulse flex-shrink-0 mt-1" />
          <div className="flex-1 min-w-0">
            <p className="font-mono text-xs font-bold text-red-400">
              NEW {toast.item.severity.toUpperCase()}: {toast.item.external_id}
            </p>
            <p className="font-mono text-xs text-hornet-dim mt-1 truncate">{toast.item.title}</p>
          </div>
          <button onClick={() => setToast(null)} className="text-hornet-muted hover:text-hornet-text flex-shrink-0">×</button>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-2 h-2 rounded-full bg-hornet-gold" />
          <h1 className="font-mono text-2xl font-bold text-hornet-gold tracking-widest">THE HIVE</h1>
        </div>
        <p className="font-mono text-sm text-hornet-dim ml-5">
          Live threat intelligence — NVD CVEs, HIBP breaches, cybersecurity news
        </p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <StatCard label="Total Threats" value={total} />
        <StatCard label="Critical" value={items.filter(i => i.severity === 'critical').length} color="text-hornet-critical" />
        <StatCard label="High" value={items.filter(i => i.severity === 'high').length} color="text-hornet-high" />
        <StatCard label="This Page" value={items.length} />
      </div>

      {/* Digest */}
      {digest && (
        <div className="hornet-panel p-5 mb-6 border-hornet-gold/20">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-hornet-gold" />
            <h2 className="font-mono text-xs font-bold text-hornet-gold tracking-widest">DAILY THREAT DIGEST</h2>
          </div>
          <div className="font-mono text-xs text-hornet-text leading-relaxed whitespace-pre-wrap">
            {digest}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <span className="font-mono text-[10px] text-hornet-dim uppercase tracking-widest">Filter:</span>
        {SEVERITY_FILTERS.map((sev) => (
          <button
            key={sev}
            onClick={() => handleSeverityChange(sev)}
            className={`px-3 py-1 rounded font-mono text-xs transition-all ${
              severity === sev
                ? 'bg-hornet-gold/10 border border-hornet-gold/40 text-hornet-gold'
                : 'bg-hornet-panel border border-hornet-border text-hornet-dim hover:border-hornet-muted'
            }`}
          >
            {sev === 'all' ? 'ALL' : sev.toUpperCase()}
          </button>
        ))}

        <div className="ml-auto">
          <button
            onClick={() => fetchFeed(page, severity)}
            className="hornet-btn-ghost text-xs"
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* Feed */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="hornet-panel p-5 animate-pulse">
              <div className="flex gap-4">
                <div className="w-2 h-2 rounded-full bg-hornet-border mt-1.5" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-hornet-border rounded w-32" />
                  <div className="h-3 bg-hornet-border rounded w-full" />
                  <div className="h-3 bg-hornet-border rounded w-3/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="hornet-panel p-12 text-center">
          <p className="font-mono text-sm text-hornet-dim">No threats found for this filter.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <CVECard key={item.id} item={item} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="hornet-btn-ghost text-xs disabled:opacity-30"
          >
            ← Prev
          </button>
          <span className="font-mono text-xs text-hornet-dim">
            {page} / {pages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={page === pages}
            className="hornet-btn-ghost text-xs disabled:opacity-30"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="hornet-panel px-4 py-3">
      <div className={`font-mono text-xl font-bold tabular-nums ${color || 'text-hornet-text'}`}>
        {value.toLocaleString()}
      </div>
      <div className="font-mono text-[10px] text-hornet-dim uppercase tracking-wider mt-0.5">
        {label}
      </div>
    </div>
  )
}
