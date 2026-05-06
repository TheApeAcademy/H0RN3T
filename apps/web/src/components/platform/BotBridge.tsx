'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { buildEyesSeedMessage, buildFeedSeedMessage } from '@/lib/context-builder'
import type { Scan, ThreatFeedItem } from '@/types/database'

interface Props {
  type: 'eyes_scan' | 'threat_feed'
  scanId?: string
  feedItemId?: string
  label?: string
  scan?: Scan
  feedItem?: ThreatFeedItem
  context?: Record<string, unknown>
}

export default function BotBridge({ type, scanId, feedItemId, label, scan, feedItem }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleInvestigate() {
    setLoading(true)

    let seedMessage = ''
    if (type === 'eyes_scan' && scan) {
      seedMessage = buildEyesSeedMessage(scan)
    } else if (type === 'threat_feed' && feedItem) {
      seedMessage = buildFeedSeedMessage(feedItem)
    }

    const contextPayload = {
      type,
      ...(scanId && { scan_id: scanId }),
      ...(feedItemId && { feed_item_id: feedItemId }),
      ...(seedMessage && { seed_message: seedMessage }),
    }

    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context: contextPayload }),
      })
      const data = await res.json()
      if (data.conversation?.id) {
        router.push(`/bot/${data.conversation.id}`)
      }
    } catch (e) {
      console.error('Failed to create conversation', e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleInvestigate}
      disabled={loading}
      className="w-full flex items-center justify-center gap-3 px-6 py-4
                 bg-hornet-gold/10 border border-hornet-gold/30 rounded-lg
                 hover:bg-hornet-gold/20 hover:border-hornet-gold/60 hover:shadow-gold
                 transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <BotIcon className="w-5 h-5 text-hornet-gold flex-shrink-0 group-hover:scale-110 transition-transform" />
      <span className="font-mono text-sm font-bold text-hornet-gold tracking-wider">
        {loading ? 'LAUNCHING INVESTIGATION...' : (label || 'INVESTIGATE WITH HORNET BOT')}
      </span>
      {!loading && (
        <svg className="w-4 h-4 text-hornet-gold/60 group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      )}
    </button>
  )
}

function BotIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="8" width="18" height="12" rx="2" />
      <path d="M12 8V4" />
      <circle cx="12" cy="3" r="1" />
      <circle cx="8.5" cy="13" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="15.5" cy="13" r="1.5" fill="currentColor" stroke="none" />
      <path d="M9 17h6" />
    </svg>
  )
}
