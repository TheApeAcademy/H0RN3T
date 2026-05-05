import json
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from lib.auth import verify_service_secret
from lib.anthropic_client import get_client
from prompts.hornet_bot import HORNET_BOT_SYSTEM

router = APIRouter()


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    conversation_id: str
    messages: list[ChatMessage]
    system: str | None = None
    model: str | None = "claude-opus-4-5"


@router.post("/stream")
async def stream_chat(
    request: ChatRequest,
    _: str = Depends(verify_service_secret),
):
    client = get_client()
    system_prompt = request.system or HORNET_BOT_SYSTEM
    model = request.model or "claude-opus-4-5"

    # Filter out system messages — they go in the system param
    messages = [
        {"role": m.role, "content": m.content}
        for m in request.messages
        if m.role in ("user", "assistant")
    ]

    # Ensure messages alternate and end with user
    if not messages or messages[-1]["role"] != "user":
        return StreamingResponse(
            iter([b"data: {\"error\": \"Last message must be from user\"}\n\ndata: [DONE]\n\n"]),
            media_type="text/event-stream",
        )

    async def generate():
        with client.messages.stream(
            model=model,
            max_tokens=4096,
            system=system_prompt,
            messages=messages,
        ) as stream:
            for event in stream:
                if hasattr(event, "type"):
                    if event.type == "message_start":
                        yield f"data: {json.dumps({'type': 'message_start', 'message': {'usage': {'input_tokens': event.message.usage.input_tokens}}})}\n\n"
                    elif event.type == "content_block_start":
                        yield f"data: {json.dumps({'type': 'content_block_start', 'index': event.index})}\n\n"
                    elif event.type == "content_block_delta":
                        yield f"data: {json.dumps({'type': 'content_block_delta', 'delta': {'text': event.delta.text}})}\n\n"
                    elif event.type == "message_delta":
                        yield f"data: {json.dumps({'type': 'message_delta', 'usage': {'output_tokens': event.usage.output_tokens}})}\n\n"
                    elif event.type == "message_stop":
                        yield "data: [DONE]\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")
