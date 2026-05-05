'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { Conversation } from '@/types/database'
import Link from 'next/link'

export default function BotPage() {
  const router = useRouter()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/conversations')
      .then((r) => r.json())
      .then((d) => setConversations(d.conversations || []))
      .catch(() => {})
  }, [])

  async function handleNewConversation() {
    setLoading(true)
    try {
      const res = await fetch('/api/conversations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) })
      const data = await res.json()
      if (data.conversation?.id) router.push(`/bot/${data.conversation.id}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-2 rounded-full bg-hornet-gold" />
              <h1 className="font-mono text-2xl font-bold text-hornet-gold tracking-widest">
                HORNET BOT
              </h1>
            </div>
            <p className="font-mono text-sm text-hornet-dim ml-5">
              Elite AI cybersecurity analyst — red team + blue team intelligence
            </p>
          </div>
          <button
            onClick={handleNewConversation}
            disabled={loading}
            className="hornet-btn disabled:opacity-50"
          >
            {loading ? 'LAUNCHING...' : '+ NEW INVESTIGATION'}
          </button>
        </div>
      </div>

      {conversations.length === 0 ? (
        <div className="hornet-panel p-12 text-center">
          <div className="text-4xl text-hornet-gold/30 mb-4 font-mono">⬡</div>
          <h2 className="font-mono text-lg font-bold text-hornet-text mb-2">No Investigations Yet</h2>
          <p className="font-mono text-sm text-hornet-dim mb-6">
            Start a new investigation or use Bot Bridge from EYES or Hive
          </p>
          <button onClick={handleNewConversation} className="hornet-btn">
            Start First Investigation
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map((conv) => (
            <Link
              key={conv.id}
              href={`/bot/${conv.id}`}
              className="hornet-panel px-5 py-4 flex items-center gap-4 hover:border-hornet-gold/30 transition-all group block"
            >
              <div className="w-8 h-8 rounded bg-hornet-gold/10 border border-hornet-gold/20 flex items-center justify-center flex-shrink-0">
                <span className="font-mono text-xs text-hornet-gold">⬡</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-mono text-sm text-hornet-text group-hover:text-hornet-gold transition-colors truncate">
                  {conv.title}
                </p>
                <p className="font-mono text-[10px] text-hornet-muted mt-0.5">
                  {new Date(conv.updated_at).toLocaleDateString()} · {conv.model}
                </p>
              </div>
              <svg className="w-4 h-4 text-hornet-muted group-hover:text-hornet-gold transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
