from __future__ import annotations

import os
from typing import Optional
from pydantic_settings import BaseSettings


def _parse_cors_origins() -> list[str]:
    raw = os.getenv("CORS_ORIGINS", "")
    if raw:
        return [o.strip() for o in raw.split(",") if o.strip()]
    return ["http://localhost:3000", "http://127.0.0.1:3000"]


class Settings(BaseSettings):
    app_name: str = "Sightline"
    database_url: str = "sqlite+aiosqlite:///./sightline.db"
    redis_url: str = "redis://localhost:6379"
    openai_api_key: Optional[str] = None
    cors_origins: list[str] = _parse_cors_origins()
    analysis_delay_ms: int = 80

    class Config:
        env_file = ".env"


settings = Settings()
