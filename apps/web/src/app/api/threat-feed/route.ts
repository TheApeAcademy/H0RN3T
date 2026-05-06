import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const severity = searchParams.get('severity')
  const source = searchParams.get('source')
  const since = searchParams.get('since')
  const limit = 20
  const offset = (page - 1) * limit

  let query = supabase
    .from('threat_feed_items')
    .select('*', { count: 'exact' })
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (severity) query = query.eq('severity', severity)
  if (source) query = query.eq('source', source)
  if (since) query = query.gte('published_at', since)

  const { data, error, count } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    items: data,
    total: count,
    page,
    pages: Math.ceil((count || 0) / limit),
  })
}
