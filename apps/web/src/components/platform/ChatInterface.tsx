'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import type { Message } from '@/types/database'

interface Props {
  conversationId: string
  initialMessages: Message[]
  onNewMessage?: (message: Message) => void
}

const SUGGESTED_QUESTIONS = [
  'What MITRE ATT&CK techniques apply here?',
  'Walk me through the exploitation steps',
  'What detection rules would catch this?',
  'Provide specific remediation commands',
  'Are there known threat actors using this?',
]

export default function ChatInterface({ conversationId, initialMessages, onNewMessage }: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingContent])

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || streaming) return

    setError(null)
    setStreaming(true)
    setStreamingContent('')

    const userMessage: Message = {
      id: crypto.randomUUID(),
      conversation_id: conversationId,
      role: 'user',
      content,
      input_tokens: null,
      output_tokens: null,
      created_at: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, userMessage])
    setInput('')

    abortRef.current = new AbortController()

    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
        signal: abortRef.current.signal,
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to send message')
      }

      if (!res.body) throw new Error('No response stream')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let fullContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        for (const line of chunk.split('\n')) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6).trim()
          if (data === '[DONE]') break
          try {
            const parsed = JSON.parse(data)
            if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
              fullContent += parsed.delta.text
              setStreamingContent(fullContent)
            }
          } catch {
            // non-JSON
          }
        }
      }

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        conversation_id: conversationId,
        role: 'assistant',
        content: fullContent,
        input_tokens: null,
        output_tokens: null,
        created_at: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, assistantMessage])
      onNewMessage?.(assistantMessage)
    } catch (e: unknown) {
      if (e instanceof Error && e.name !== 'AbortError') {
        setError(e.message)
      }
    } finally {
      setStreamingContent('')
      setStreaming(false)
    }
  }, [conversationId, streaming, onNewMessage])

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  function handleAbort() {
    abortRef.current?.abort()
  }

  const allMessages = messages.filter((m) => m.role !== 'system')

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
        {allMessages.length === 0 && !streaming && (
          <div className="text-center py-12">
            <div className="font-mono text-4xl text-hornet-gold/30 mb-4">⬡</div>
            <p className="font-mono text-sm text-hornet-dim">
              HORNET BOT is ready. Ask anything about cybersecurity.
            </p>
          </div>
        )}

        {allMessages.map((message) => (
          <ChatBubble key={message.id} message={message} />
        ))}

        {/* Streaming bubble */}
        {streaming && streamingContent && (
          <ChatBubble
            message={{
              id: 'streaming',
              conversation_id: conversationId,
              role: 'assistant',
              content: streamingContent,
              input_tokens: null,
              output_tokens: null,
              created_at: new Date().toISOString(),
            }}
            isStreaming
          />
        )}

        {/* Thinking indicator */}
        {streaming && !streamingContent && (
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-hornet-gold/10 border border-hornet-gold/30 flex items-center justify-center flex-shrink-0">
              <span className="font-mono text-[10px] text-hornet-gold">H</span>
            </div>
            <div className="flex gap-1 py-3 px-4 bg-hornet-panel rounded-lg border border-hornet-border">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-hornet-gold animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Suggested questions */}
      {!streaming && allMessages.length > 0 && allMessages[allMessages.length - 1]?.role === 'assistant' && (
        <div className="px-6 pb-2">
          <div className="flex gap-2 flex-wrap">
            {SUGGESTED_QUESTIONS.slice(0, 3).map((q) => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                className="px-3 py-1.5 bg-hornet-panel border border-hornet-border rounded
                           font-mono text-[11px] text-hornet-dim hover:border-hornet-gold/40
                           hover:text-hornet-gold transition-colors truncate max-w-xs"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="mx-6 mb-2 p-2 bg-red-950/50 border border-red-900/50 rounded font-mono text-xs text-red-400">
          {error}
        </div>
      )}

      {/* Input area */}
      <div className="px-6 pb-6 pt-2">
        <div className="hornet-panel flex items-end gap-3 p-3">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask HORNET BOT anything... (Enter to send, Shift+Enter for newline)"
            disabled={streaming}
            rows={1}
            className="flex-1 bg-transparent font-mono text-sm text-hornet-text placeholder-hornet-muted
                       focus:outline-none resize-none disabled:opacity-50"
            style={{ maxHeight: '120px', overflowY: 'auto' }}
            onInput={(e) => {
              const t = e.currentTarget
              t.style.height = 'auto'
              t.style.height = Math.min(t.scrollHeight, 120) + 'px'
            }}
          />

          {streaming ? (
            <button
              onClick={handleAbort}
              className="flex-shrink-0 w-8 h-8 flex items-center justify-center
                         bg-red-900/30 border border-red-900/50 rounded text-red-400
                         hover:bg-red-900/50 transition-colors"
            >
              <span className="font-mono text-xs">■</span>
            </button>
          ) : (
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim()}
              className="flex-shrink-0 w-8 h-8 flex items-center justify-center
                         bg-hornet-gold/10 border border-hornet-gold/30 rounded text-hornet-gold
                         hover:bg-hornet-gold/20 transition-colors
                         disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            </button>
          )}
        </div>
        <p className="font-mono text-[10px] text-hornet-muted mt-1.5 text-center">
          HORNET thinks like a red team operator AND blue team defender
        </p>
      </div>
    </div>
  )
}

function ChatBubble({ message, isStreaming }: { message: Message; isStreaming?: boolean }) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0
        ${isUser
          ? 'bg-hornet-muted/30 border border-hornet-muted/50'
          : 'bg-hornet-gold/10 border border-hornet-gold/30'
        }`}
      >
        <span className={`font-mono text-[10px] font-bold ${isUser ? 'text-hornet-dim' : 'text-hornet-gold'}`}>
          {isUser ? 'U' : 'H'}
        </span>
      </div>

      {/* Content */}
      <div className={`max-w-[80%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <div
          className={`rounded-lg px-4 py-3 font-mono text-sm leading-relaxed
            ${isUser
              ? 'bg-hornet-muted/20 border border-hornet-muted/30 text-hornet-text'
              : 'bg-hornet-panel border border-hornet-border text-hornet-text'
            }`}
          style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
        >
          {message.content}
          {isStreaming && (
            <span className="inline-block w-0.5 h-4 bg-hornet-gold ml-0.5 animate-pulse align-middle" />
          )}
        </div>
        <span className="font-mono text-[10px] text-hornet-muted">
          {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  )
}
