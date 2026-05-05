const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000'
const SERVICE_SECRET = process.env.SERVICE_SECRET!

function serviceHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'X-Service-Secret': SERVICE_SECRET,
  }
}

export async function streamChat(payload: {
  conversation_id: string
  messages: Array<{ role: string; content: string }>
  system?: string
  model?: string
}): Promise<Response> {
  const res = await fetch(`${AI_SERVICE_URL}/chat/stream`, {
    method: 'POST',
    headers: serviceHeaders(),
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    throw new Error(`AI service error: ${res.status}`)
  }
  return res
}

export async function synthesizeAnalysis(payload: {
  scan_id: string
  raw_analysis: unknown
  file_name: string
  media_type: string
}): Promise<{
  explanation: string
  key_findings: string[]
  technical_indicators: string[]
  confidence_note: string
  threat_context: string
  recommended_actions: string[]
}> {
  const res = await fetch(`${AI_SERVICE_URL}/analysis/synthesize`, {
    method: 'POST',
    headers: serviceHeaders(),
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    throw new Error(`AI synthesis error: ${res.status}`)
  }
  return res.json()
}

export async function summarizeFeed(payload: {
  items: Array<{
    id: string
    external_id: string
    title: string
    description: string
    severity: string
    cvss_score: number | null
  }>
}): Promise<{
  digest: string
  top_threats: string[]
  action_items: string[]
  notable_pattern: string
}> {
  const res = await fetch(`${AI_SERVICE_URL}/summarize/feed`, {
    method: 'POST',
    headers: serviceHeaders(),
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    throw new Error(`Feed summarize error: ${res.status}`)
  }
  return res.json()
}
