from __future__ import annotations

import os
from typing import Optional
from pydantic import Field
from pydantic_settings import BaseSettings


def parse_cors_origins(raw: str) -> list[str]:
    if raw.strip() == "*":
        return ["*"]
    if raw.strip():
        return [o.strip() for o in raw.split(",") if o.strip()]
    return ["http://localhost:3000", "http://127.0.0.1:3000"]


class Settings(BaseSettings):
    app_name: str = "Sightline"
    database_url: str = "sqlite+aiosqlite:///./sightline.db"
    redis_url: str = "redis://localhost:6379"
    openai_api_key: Optional[str] = None
    cors_origins_raw: str = Field(default="", validation_alias="CORS_ORIGINS")
    analysis_delay_ms: int = 80

    class Config:
        env_file = ".env"

    @property
    def cors_origins(self) -> list[str]:
        return parse_cors_origins(self.cors_origins_raw)


settings = Settings()
