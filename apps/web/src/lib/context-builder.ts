import type { Scan, ThreatFeedItem } from '@/types/database'

export function buildEyesSeedMessage(scan: Scan): string {
  const keyFindings = scan.raw_analysis
    ? extractKeyFindings(scan.raw_analysis as Record<string, unknown>)
    : []

  return `## EYES Scan — Investigation Request
File: ${scan.file_name} | Type: ${scan.media_type}
Trust Score: ${scan.trust_score}/100 | Verdict: ${scan.verdict?.replace(/_/g, ' ').toUpperCase()}

${scan.ai_explanation || 'No AI explanation available yet.'}

${keyFindings.length > 0 ? `Key Findings: ${keyFindings.join(', ')}` : ''}

I need deeper investigation: threat implications, weaponization vectors, attribution steps, and recommended downstream actions.`
}

export function buildFeedSeedMessage(item: ThreatFeedItem): string {
  return `## Threat Intelligence — Investigation Request
${item.external_id} | ${item.severity.toUpperCase()} | CVSS ${item.cvss_score ?? 'N/A'}
${item.title}

${item.description}

${item.summary ? `Summary: ${item.summary}\n` : ''}
Analyze fully: technical breakdown, exploitation status, affected versions, step-by-step remediation with verification commands, MITRE ATT&CK mapping.`
}

function extractKeyFindings(raw: Record<string, unknown>): string[] {
  const findings: string[] = []
  if (raw.key_findings && Array.isArray(raw.key_findings)) {
    return raw.key_findings as string[]
  }
  if (raw.technical_indicators && Array.isArray(raw.technical_indicators)) {
    findings.push(...(raw.technical_indicators as string[]).slice(0, 3))
  }
  return findings
}
