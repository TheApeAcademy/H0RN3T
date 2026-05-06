import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('conversations')
    .select('*, messages(count)')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })
    .limit(50)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ conversations: data })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { context?: { type: string; scan_id?: string; feed_item_id?: string; seed_message?: string }; title?: string }
  try {
    body = await request.json()
  } catch {
    body = {}
  }

  const title = body.title || generateTitle(body.context)

  const { data: conversation, error } = await supabase
    .from('conversations')
    .insert({
      user_id: user.id,
      title,
      context: body.context || null,
      model: 'claude-opus-4-5',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // If seed message provided, insert it
  if (body.context?.seed_message) {
    await supabase.from('messages').insert({
      conversation_id: conversation.id,
      role: 'user',
      content: body.context.seed_message,
    })
  }

  return NextResponse.json({ conversation }, { status: 201 })
}

function generateTitle(context?: { type?: string; scan_id?: string; feed_item_id?: string }) {
  if (!context) return `Investigation — ${new Date().toLocaleDateString()}`
  if (context.type === 'eyes_scan') return `EYES Scan Analysis — ${new Date().toLocaleDateString()}`
  if (context.type === 'threat_feed') return `Threat Intel Investigation — ${new Date().toLocaleDateString()}`
  return `Investigation — ${new Date().toLocaleDateString()}`
}
