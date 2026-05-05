'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import ScanUploadZone from '@/components/platform/ScanUploadZone'
import TrustScoreCounter from '@/components/platform/TrustScoreCounter'
import AIOverviewPanel from '@/components/platform/AIOverviewPanel'
import type { Scan } from '@/types/database'

type PageState = 'IDLE' | 'UPLOADING' | 'PROCESSING' | 'ANIMATING' | 'COMPLETE'

export default function EyesPage() {
  const [pageState, setPageState] = useState<PageState>('IDLE')
  const [currentScan, setCurrentScan] = useState<Scan | null>(null)
  const [scanHistory, setScanHistory] = useState<Scan[]>([])
  const [error, setError] = useState<string | null>(null)
  const [showOverview, setShowOverview] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetch('/api/scans')
      .then((r) => r.json())
      .then((d) => setScanHistory(d.scans || []))
      .catch(() => {})
  }, [])

  const handleUpload = useCallback(async (file: File) => {
    setError(null)
    setShowOverview(false)
    setPageState('UPLOADING')
    setCurrentScan(null)

    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch('/api/scans', { method: 'POST', body: formData })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Upload failed')
      setPageState('IDLE')
      return
    }

    const scanId = data.scan_id
    setPageState('PROCESSING')

    // Subscribe to Realtime for scan updates
    const channel = supabase
      .channel(`scan:${scanId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'scans', filter: `id=eq.${scanId}` },
        (payload) => {
          const updated = payload.new as Scan
          if (updated.status === 'complete' || updated.status === 'failed') {
            setCurrentScan(updated)
            channel.unsubscribe()
            if (updated.status === 'complete') {
              setPageState('ANIMATING')
            } else {
              setError('Analysis failed. Please try again.')
              setPageState('IDLE')
            }
          }
        }
      )
      .subscribe()

    // Fallback: poll every 3s
    const pollInterval = setInterval(async () => {
      const r = await fetch(`/api/scans/${scanId}`)
      const d = await r.json()
      if (d.scan?.status === 'complete' || d.scan?.status === 'failed') {
        clearInterval(pollInterval)
        if (d.scan.status === 'complete') {
          setCurrentScan(d.scan)
          setPageState('ANIMATING')
          channel.unsubscribe()
        } else {
          setError('Analysis failed')
          setPageState('IDLE')
        }
      }
    }, 3000)

    return () => {
      channel.unsubscribe()
      clearInterval(pollInterval)
    }
  }, [supabase])

  function handleAnimationComplete() {
    setPageState('COMPLETE')
    setTimeout(() => setShowOverview(true), 200)
  }

  function handleNewScan() {
    setPageState('IDLE')
    setCurrentScan(null)
    setShowOverview(false)
    setError(null)
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-2 h-2 rounded-full bg-hornet-gold" />
          <h1 className="font-mono text-2xl font-bold text-hornet-gold tracking-widest">
            EYES
          </h1>
        </div>
        <p className="font-mono text-sm text-hornet-dim ml-5">
          AI-powered deepfake detection — image, video, and audio analysis
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-950/50 border border-red-900/50 rounded font-mono text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Upload + Score */}
        <div className="space-y-6">
          {pageState === 'IDLE' || pageState === 'UPLOADING' ? (
            <ScanUploadZone
              onUpload={handleUpload}
              disabled={pageState === 'UPLOADING'}
            />
          ) : (
            <div className="hornet-panel p-8 flex flex-col items-center gap-4">
              <TrustScoreCounter
                score={currentScan?.trust_score ?? null}
                state={pageState}
                verdict={currentScan?.verdict ?? null}
                onAnimationComplete={handleAnimationComplete}
              />

              {currentScan && (
                <div className="w-full text-center space-y-1">
                  <p className="font-mono text-xs text-hornet-dim truncate">
                    {currentScan.file_name}
                  </p>
                  <p className="font-mono text-[10px] text-hornet-muted">
                    {(currentScan.file_size / 1024 / 1024).toFixed(2)} MB · {currentScan.media_type}
                  </p>
                </div>
              )}

              {pageState === 'COMPLETE' && (
                <button onClick={handleNewScan} className="hornet-btn-ghost text-xs">
                  Analyze New File
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right: AI Overview */}
        <div>
          {currentScan && showOverview ? (
            <AIOverviewPanel scan={currentScan} visible={showOverview} />
          ) : (
            <div className="hornet-panel p-6 h-full flex flex-col items-center justify-center text-center opacity-40">
              <div className="w-12 h-12 border-2 border-hornet-muted rounded-lg flex items-center justify-center mb-3">
                <span className="font-mono text-hornet-muted text-xl">AI</span>
              </div>
              <p className="font-mono text-sm text-hornet-dim">
                AI forensic analysis will appear here after scan completes
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Scan History */}
      {scanHistory.length > 0 && (
        <div className="mt-10">
          <h2 className="font-mono text-sm font-bold text-hornet-dim uppercase tracking-widest mb-4">
            Recent Scans
          </h2>
          <div className="space-y-2">
            {scanHistory.slice(0, 10).map((scan) => (
              <ScanHistoryRow key={scan.id} scan={scan} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ScanHistoryRow({ scan }: { scan: Scan }) {
  const color =
    scan.trust_score !== null
      ? scan.trust_score >= 90 ? '#22c55e'
        : scan.trust_score >= 70 ? '#eab308'
        : scan.trust_score >= 40 ? '#f97316'
        : '#ef4444'
      : '#888'

  return (
    <div className="hornet-panel px-4 py-3 flex items-center gap-4 hover:border-hornet-muted transition-colors">
      <div className="w-8 h-8 rounded border border-hornet-border flex items-center justify-center flex-shrink-0">
        <span className="font-mono text-[10px] text-hornet-dim uppercase">
          {scan.media_type.slice(0, 3)}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-mono text-xs text-hornet-text truncate">{scan.file_name}</p>
        <p className="font-mono text-[10px] text-hornet-muted mt-0.5">
          {new Date(scan.created_at).toLocaleDateString()}
        </p>
      </div>

      {scan.trust_score !== null && (
        <div className="text-right flex-shrink-0">
          <div className="font-mono text-lg font-bold tabular-nums" style={{ color }}>
            {scan.trust_score}
          </div>
          <div className="font-mono text-[10px] text-hornet-dim">score</div>
        </div>
      )}

      <div className="flex-shrink-0">
        <StatusBadge status={scan.status} />
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: 'text-hornet-dim border-hornet-border',
    processing: 'text-hornet-gold border-hornet-gold/30 animate-pulse',
    complete: 'text-hornet-green border-hornet-green/30',
    failed: 'text-red-400 border-red-900/50',
  }
  return (
    <span className={`px-2 py-0.5 border rounded font-mono text-[10px] uppercase tracking-wider ${styles[status] || styles.pending}`}>
      {status}
    </span>
  )
}
