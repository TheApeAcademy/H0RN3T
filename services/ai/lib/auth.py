import os
from fastapi import HTTPException, Security
from fastapi.security.api_key import APIKeyHeader

SERVICE_SECRET = os.getenv("SERVICE_SECRET", "")
api_key_header = APIKeyHeader(name="X-Service-Secret", auto_error=False)


async def verify_service_secret(api_key: str = Security(api_key_header)) -> str:
    if not SERVICE_SECRET:
        raise HTTPException(status_code=500, detail="Service secret not configured")
    if api_key != SERVICE_SECRET:
        raise HTTPException(status_code=403, detail="Invalid service secret")
    return api_key
