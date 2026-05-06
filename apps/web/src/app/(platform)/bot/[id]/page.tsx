import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ChatInterface from '@/components/platform/ChatInterface'
import Link from 'next/link'

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) notFound()

  const { data: conversation } = await supabase
    .from('conversations')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!conversation) notFound()

  const { data: messages } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', id)
    .order('created_at', { ascending: true })

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-3 border-b border-hornet-border bg-hornet-dark flex-shrink-0">
        <Link
          href="/bot"
          className="font-mono text-xs text-hornet-dim hover:text-hornet-text transition-colors"
        >
          ← INVESTIGATIONS
        </Link>
        <div className="w-px h-4 bg-hornet-border" />
        <div className="flex-1 min-w-0">
          <h1 className="font-mono text-sm font-bold text-hornet-text truncate">
            {conversation.title}
          </h1>
          <p className="font-mono text-[10px] text-hornet-muted">
            Model: {conversation.model}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-hornet-green animate-pulse" />
          <span className="font-mono text-[10px] text-hornet-dim">ONLINE</span>
        </div>
      </div>

      {/* Chat */}
      <div className="flex-1 overflow-hidden">
        <ChatInterface
          conversationId={id}
          initialMessages={messages || []}
        />
      </div>
    </div>
  )
}
