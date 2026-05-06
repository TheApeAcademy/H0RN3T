import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const HIVE_API_KEY = Deno.env.get('HIVE_API_KEY')!
const AI_SERVICE_URL = Deno.env.get('AI_SERVICE_URL')!
const SERVICE_SECRET = Deno.env.get('SERVICE_SECRET')!

Deno.serve(async (req) => {
  try {
    const payload = await req.json()
    // DB webhook payload structure: { type, table, record, old_record }
    const record = payload.record

    if (!record?.id || record.status !== 'pending') {
      return new Response(JSON.stringify({ skipped: true }), { status: 200 })
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Mark as processing
    await supabase
      .from('scans')
      .update({ status: 'processing' })
      .eq('id', record.id)

    // Get signed URL for the file
    const { data: signedUrl } = await supabase.storage
      .from('scans')
      .createSignedUrl(record.storage_path, 300) // 5 min

    if (!signedUrl?.signedUrl) {
      throw new Error('Could not create signed URL')
    }

    // Call Hive deepfake detection API
    const hiveRes = await callHiveAPI(signedUrl.signedUrl, record.media_type)

    // Call AI service for explanation synthesis
    let aiResult = null
    try {
      const aiRes = await fetch(`${AI_SERVICE_URL}/analysis/synthesize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Service-Secret': SERVICE_SECRET,
        },
        body: JSON.stringify({
          scan_id: record.id,
          raw_analysis: hiveRes,
          file_name: record.file_name,
          media_type: record.media_type,
        }),
      })
      if (aiRes.ok) aiResult = await aiRes.json()
    } catch (e) {
      console.error('AI synthesis failed:', e)
    }

    // Compute trust score from Hive response
    const trustScore = computeTrustScore(hiveRes)
    const verdict = computeVerdict(trustScore)

    // Update scan with results
    await supabase
      .from('scans')
      .update({
        status: 'complete',
        trust_score: trustScore,
        verdict,
        raw_analysis: {
          ...hiveRes,
          ...(aiResult || {}),
        },
        ai_explanation: aiResult?.explanation || null,
        completed_at: new Date().toISOString(),
      })
      .eq('id', record.id)

    return new Response(JSON.stringify({ success: true, scan_id: record.id }), { status: 200 })
  } catch (error) {
    console.error('process-scan error:', error)

    // Mark scan as failed
    const payload = await req.json().catch(() => ({}))
    if (payload?.record?.id) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
      await supabase
        .from('scans')
        .update({ status: 'failed' })
        .eq('id', payload.record.id)
    }

    return new Response(JSON.stringify({ error: String(error) }), { status: 500 })
  }
})

async function callHiveAPI(fileUrl: string, mediaType: string): Promise<Record<string, unknown>> {
  const endpoint = mediaType === 'audio'
    ? 'https://api.thehive.ai/api/v2/task/sync'
    : mediaType === 'video'
    ? 'https://api.thehive.ai/api/v2/task/sync'
    : 'https://api.thehive.ai/api/v2/task/sync'

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Token ${HIVE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url: fileUrl,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Hive API error ${res.status}: ${text}`)
  }

  return res.json()
}

function computeTrustScore(hiveResponse: Record<string, unknown>): number {
  // Extract authenticity score from Hive API response
  // Hive returns status[].response[].output[].classes[]
  try {
    const status = hiveResponse.status as Array<{ response: { output: Array<{ classes: Array<{ class: string; score: number }> }> } }>
    if (!status?.[0]?.response?.output) return 50

    for (const output of status[0].response.output) {
      for (const cls of output.classes) {
        if (cls.class === 'real' || cls.class === 'authentic') {
          return Math.round(cls.score * 100)
        }
        if (cls.class === 'fake' || cls.class === 'ai-generated') {
          return Math.round((1 - cls.score) * 100)
        }
      }
    }
  } catch {
    // fallback
  }
  return 50
}

function computeVerdict(score: number): string {
  if (score >= 90) return 'authentic'
  if (score >= 70) return 'likely_authentic'
  if (score >= 50) return 'suspicious'
  if (score >= 30) return 'likely_fake'
  return 'fake'
}
