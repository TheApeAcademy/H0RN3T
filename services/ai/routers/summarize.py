import json
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from lib.auth import verify_service_secret
from lib.anthropic_client import get_client
from prompts.hive_news import HIVE_NEWS_SYSTEM, HIVE_NEWS_USER_TEMPLATE

router = APIRouter()


class FeedItem(BaseModel):
    id: str
    external_id: str
    title: str
    description: str
    severity: str
    cvss_score: float | None = None


class SummarizeFeedRequest(BaseModel):
    items: list[FeedItem]


@router.post("/feed")
async def summarize_feed(
    request: SummarizeFeedRequest,
    _: str = Depends(verify_service_secret),
):
    if not request.items:
        raise HTTPException(status_code=400, detail="No items provided")

    client = get_client()

    items_json = json.dumps(
        [item.model_dump() for item in request.items[:50]],  # cap at 50
        indent=2,
    )

    user_message = HIVE_NEWS_USER_TEMPLATE.format(items_json=items_json)

    message = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=2048,
        system=HIVE_NEWS_SYSTEM,
        messages=[{"role": "user", "content": user_message}],
    )

    content = message.content[0].text.strip()

    if content.startswith("```"):
        lines = content.split("\n")
        content = "\n".join(lines[1:-1] if lines[-1] == "```" else lines[1:])

    try:
        result = json.loads(content)
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail=f"AI returned invalid JSON: {content[:200]}")

    return result
