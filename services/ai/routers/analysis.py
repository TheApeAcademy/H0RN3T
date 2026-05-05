import json
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from lib.auth import verify_service_secret
from lib.anthropic_client import get_client
from prompts.eyes_synthesis import EYES_SYNTHESIS_SYSTEM, EYES_SYNTHESIS_USER_TEMPLATE

router = APIRouter()


class SynthesizeRequest(BaseModel):
    scan_id: str
    raw_analysis: dict
    file_name: str
    media_type: str


@router.post("/synthesize")
async def synthesize_analysis(
    request: SynthesizeRequest,
    _: str = Depends(verify_service_secret),
):
    client = get_client()

    user_message = EYES_SYNTHESIS_USER_TEMPLATE.format(
        file_name=request.file_name,
        media_type=request.media_type,
        raw_analysis=json.dumps(request.raw_analysis, indent=2),
    )

    message = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=1024,
        system=EYES_SYNTHESIS_SYSTEM,
        messages=[{"role": "user", "content": user_message}],
    )

    content = message.content[0].text.strip()

    # Strip markdown code fences if present
    if content.startswith("```"):
        lines = content.split("\n")
        content = "\n".join(lines[1:-1] if lines[-1] == "```" else lines[1:])

    try:
        result = json.loads(content)
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail=f"AI returned invalid JSON: {content[:200]}")

    return result
