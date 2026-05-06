from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from routers import chat, analysis, summarize

load_dotenv()

app = FastAPI(
    title="H0RN3T AI Service",
    version="1.0.0",
    docs_url="/docs" if __import__("os").getenv("ENV") != "production" else None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)

app.include_router(chat.router, prefix="/chat", tags=["chat"])
app.include_router(analysis.router, prefix="/analysis", tags=["analysis"])
app.include_router(summarize.router, prefix="/summarize", tags=["summarize"])


@app.get("/health")
async def health():
    return {"status": "online", "service": "h0rn3t-ai"}
