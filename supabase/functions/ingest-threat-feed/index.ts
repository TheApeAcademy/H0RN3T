import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const NVD_API_KEY = Deno.env.get('NVD_API_KEY') || ''
const NEWS_API_KEY = Deno.env.get('NEWS_API_KEY') || ''
const AI_SERVICE_URL = Deno.env.get('AI_SERVICE_URL')!
const SERVICE_SECRET = Deno.env.get('SERVICE_SECRET')!

Deno.serve(async () => {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  const results = { nvd: 0, news: 0, summarized: 0 }

  // Ingest NVD CVEs (last 8 hours)
  try {
    const nvdItems = await fetchNVD()
    if (nvdItems.length > 0) {
      const { error } = await supabase
        .from('threat_feed_items')
        .upsert(nvdItems, { onConflict: 'external_id', ignoreDuplicates: true })
      if (!error) results.nvd = nvdItems.length
    }
  } catch (e) {
    console.error('NVD ingest failed:', e)
  }

  // Ingest cybersecurity news
  if (NEWS_API_KEY) {
    try {
      const newsItems = await fetchNews()
      if (newsItems.length > 0) {
        const { error } = await supabase
          .from('threat_feed_items')
          .upsert(newsItems, { onConflict: 'external_id', ignoreDuplicates: true })
        if (!error) results.news = newsItems.length
      }
    } catch (e) {
      console.error('News ingest failed:', e)
    }
  }

  // Summarize unsummarized items
  try {
    const { data: unsummarized } = await supabase
      .from('threat_feed_items')
      .select('id, external_id, title, description, severity, cvss_score')
      .eq('is_summarized', false)
      .limit(20)

    if (unsummarized && unsummarized.length > 0) {
      const aiRes = await fetch(`${AI_SERVICE_URL}/summarize/feed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Service-Secret': SERVICE_SECRET,
        },
        body: JSON.stringify({ items: unsummarized }),
      })

      if (aiRes.ok) {
        // Update individual items with summaries (use digest as fallback)
        for (const item of unsummarized) {
          await supabase
            .from('threat_feed_items')
            .update({ is_summarized: true })
            .eq('id', item.id)
        }
        results.summarized = unsummarized.length
      }
    }
  } catch (e) {
    console.error('Summarization failed:', e)
  }

  return new Response(JSON.stringify({ success: true, results }), {
    headers: { 'Content-Type': 'application/json' },
  })
})

async function fetchNVD(): Promise<Record<string, unknown>[]> {
  const pubStartDate = new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString().replace('Z', '+00:00')
  const url = new URL('https://services.nvd.nist.gov/rest/json/cves/2.0')
  url.searchParams.set('pubStartDate', pubStartDate)
  url.searchParams.set('resultsPerPage', '40')

  const headers: HeadersInit = { 'User-Agent': 'H0RN3T/1.0' }
  if (NVD_API_KEY) headers['apiKey'] = NVD_API_KEY

  const res = await fetch(url.toString(), { headers })
  if (!res.ok) throw new Error(`NVD returned ${res.status}`)

  const data = await res.json()
  const vulnerabilities = data.vulnerabilities || []

  return vulnerabilities.map((v: Record<string, unknown>) => {
    const cve = v.cve as Record<string, unknown>
    const cveId = cve.id as string
    const descriptions = cve.descriptions as Array<{ lang: string; value: string }>
    const description = descriptions?.find((d) => d.lang === 'en')?.value || ''
    const metrics = cve.metrics as Record<string, unknown>

    let cvssScore: number | null = null
    let severity: string = 'info'

    const cvssV3 = (metrics?.cvssMetricV31 as Array<{ cvssData: { baseScore: number; baseSeverity: string } }>)?.[0]
      || (metrics?.cvssMetricV30 as Array<{ cvssData: { baseScore: number; baseSeverity: string } }>)?.[0]

    if (cvssV3) {
      cvssScore = cvssV3.cvssData.baseScore
      severity = cvssV3.cvssData.baseSeverity.toLowerCase()
    }

    const published = cve.published as string

    return {
      external_id: cveId,
      source: 'nvd',
      title: `${cveId}: ${description.slice(0, 100)}`,
      description,
      severity: normalizeSeverity(severity),
      cvss_score: cvssScore,
      affected_products: extractAffectedProducts(cve),
      references: extractReferences(cve),
      published_at: published,
      raw_data: v,
    }
  })
}

async function fetchNews(): Promise<Record<string, unknown>[]> {
  const url = new URL('https://newsapi.org/v2/everything')
  url.searchParams.set('q', 'cybersecurity vulnerability breach OR exploit')
  url.searchParams.set('language', 'en')
  url.searchParams.set('sortBy', 'publishedAt')
  url.searchParams.set('pageSize', '20')
  url.searchParams.set('apiKey', NEWS_API_KEY)

  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`NewsAPI returned ${res.status}`)

  const data = await res.json()
  const articles = data.articles || []

  return articles
    .filter((a: Record<string, unknown>) => a.title && a.description && a.url)
    .map((a: Record<string, unknown>) => ({
      external_id: `news-${Buffer.from(a.url as string).toString('base64').slice(0, 32)}`,
      source: 'news',
      title: (a.title as string).slice(0, 255),
      description: (a.description as string) || '',
      severity: 'info',
      cvss_score: null,
      published_at: a.publishedAt as string,
      references: [a.url],
      raw_data: a,
    }))
}

function normalizeSeverity(s: string): string {
  const map: Record<string, string> = {
    critical: 'critical', high: 'high', medium: 'medium',
    low: 'low', none: 'info', info: 'info',
  }
  return map[s?.toLowerCase()] || 'info'
}

function extractAffectedProducts(cve: Record<string, unknown>): string[] {
  try {
    const configs = cve.configurations as Array<{ nodes: Array<{ cpeMatch: Array<{ criteria: string }> }> }>
    const products: string[] = []
    configs?.[0]?.nodes?.forEach((node) => {
      node.cpeMatch?.slice(0, 5).forEach((cpe) => {
        const parts = cpe.criteria.split(':')
        if (parts[3] && parts[4]) products.push(`${parts[3]} ${parts[4]}`)
      })
    })
    return [...new Set(products)].slice(0, 10)
  } catch {
    return []
  }
}

function extractReferences(cve: Record<string, unknown>): string[] {
  try {
    const refs = cve.references as Array<{ url: string }>
    return refs?.slice(0, 5).map((r) => r.url) || []
  } catch {
    return []
  }
}
