import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { streamChat } from '@/lib/ai-service'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Verify conversation ownership
  const { data: conversation, error: convError } = await supabase
    .from('conversations')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (convError || !conversation) {
    return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
  }

  let body: { content: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  if (!body.content?.trim()) {
    return NextResponse.json({ error: 'Message content required' }, { status: 400 })
  }

  const serviceSupabase = await createServiceClient()

  // Insert user message
  await serviceSupabase.from('messages').insert({
    conversation_id: id,
    role: 'user',
    content: body.content,
  })

  // Load full message history
  const { data: history } = await serviceSupabase
    .from('messages')
    .select('role, content')
    .eq('conversation_id', id)
    .order('created_at', { ascending: true })

  const messages = (history || []).map((m) => ({ role: m.role, content: m.content }))

  // Call FastAPI streaming endpoint
  let aiResponse: Response
  try {
    aiResponse = await streamChat({
      conversation_id: id,
      messages,
      model: conversation.model,
    })
  } catch (e) {
    return NextResponse.json({ error: `AI service unavailable: ${e}` }, { status: 503 })
  }

  if (!aiResponse.body) {
    return NextResponse.json({ error: 'No stream from AI service' }, { status: 502 })
  }

  // Tee the stream: one half → browser, one half → DB accumulation
  const [browserStream, dbStream] = aiResponse.body.tee()

  // Accumulate and persist in background
  persistStreamedMessage(dbStream, id, serviceSupabase)

  // Update conversation timestamp
  serviceSupabase.from('conversations').update({ updated_at: new Date().toISOString() }).eq('id', id)

  return new NextResponse(browserStream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}

async function persistStreamedMessage(
  stream: ReadableStream,
  conversationId: string,
  supabase: Awaited<ReturnType<typeof createServiceClient>>
) {
  let fullContent = ''
  let inputTokens = 0
  let outputTokens = 0

  try {
    const reader = stream.getReader()
    const decoder = new TextDecoder()

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
          if (parsed.type === 'content_block_delta') {
            fullContent += parsed.delta?.text || ''
          } else if (parsed.type === 'message_delta') {
            outputTokens = parsed.usage?.output_tokens || 0
          } else if (parsed.type === 'message_start') {
            inputTokens = parsed.message?.usage?.input_tokens || 0
          }
        } catch {
          // non-JSON SSE line
        }
      }
    }

    if (fullContent) {
      await supabase.from('messages').insert({
        conversation_id: conversationId,
        role: 'assistant',
        content: fullContent,
        input_tokens: inputTokens,
        output_tokens: outputTokens,
      })
    }
  } catch {
    // Background persistence failure — non-fatal
  }
}
