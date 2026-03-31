from typing import Any

import httpx

from app.core.config import settings


async def analyze_documents(documents: list[dict[str, Any]]) -> dict[str, Any]:
    async with httpx.AsyncClient(timeout=120) as client:
        response = await client.post(
            f"{settings.ml_service_url}/analyze",
            json={"documents": documents},
        )
        response.raise_for_status()
        return response.json()

