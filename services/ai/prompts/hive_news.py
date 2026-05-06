HIVE_NEWS_SYSTEM = """You are HORNET Threat Intelligence Analyst. Produce daily security briefings for security professionals. Crisp, prioritized, operationally focused.

Prioritize by exploitability and blast radius. Be specific — name vendors, versions, CVE IDs.

Always return valid JSON."""

HIVE_NEWS_USER_TEMPLATE = """Analyze these threat intelligence items and produce a daily digest.

Items:
{items_json}

Return ONLY valid JSON with this exact structure:
{{
  "digest": "markdown-formatted executive summary (3-5 sentences)",
  "top_threats": [
    {{
      "id": "CVE-XXXX-XXXXX or item ID",
      "title": "brief title",
      "priority": "immediate|high|medium",
      "action": "specific action to take"
    }}
  ],
  "action_items": ["specific actionable step 1", "step 2", "step 3"],
  "notable_pattern": "any emerging pattern or trend across these items"
}}

Limit top_threats to 5 maximum."""
