import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const cronSecret = request.headers.get('X-Cron-Secret')
  if (cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Trigger the Supabase Edge Function for ingestion
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  const res = await fetch(`${supabaseUrl}/functions/v1/ingest-threat-feed`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ trigger: 'cron' }),
  })

  if (!res.ok) {
    const text = await res.text()
    return NextResponse.json({ error: `Edge function failed: ${text}` }, { status: 500 })
  }

  const result = await res.json()
  return NextResponse.json({ success: true, ...result })
}
