from __future__ import annotations

from typing import Optional
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Text, create_engine
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base
import json

from app.core.config import settings

Base = declarative_base()


class JobRecord(Base):
    __tablename__ = "jobs"

    job_id = Column(String, primary_key=True)
    share_id = Column(String, unique=True, index=True)
    url = Column(String, nullable=False)
    profile_json = Column(Text, nullable=True)
    status = Column(String, default="pending")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


engine = create_async_engine(settings.database_url, echo=False)
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def save_job(job_id: str, share_id: str, url: str, profile_json: Optional[str] = None, status: str = "pending"):
    async with async_session() as session:
        record = JobRecord(
            job_id=job_id,
            share_id=share_id,
            url=url,
            profile_json=profile_json,
            status=status,
        )
        session.add(record)
        await session.commit()


async def update_job(job_id: str, profile_json: str, status: str = "complete"):
    async with async_session() as session:
        from sqlalchemy import select
        result = await session.execute(select(JobRecord).where(JobRecord.job_id == job_id))
        record = result.scalar_one_or_none()
        if record:
            record.profile_json = profile_json
            record.status = status
            await session.commit()


async def get_job_by_id(job_id: str) -> JobRecord | None:
    async with async_session() as session:
        from sqlalchemy import select
        result = await session.execute(select(JobRecord).where(JobRecord.job_id == job_id))
        return result.scalar_one_or_none()


async def get_job_by_share(share_id: str) -> JobRecord | None:
    async with async_session() as session:
        from sqlalchemy import select
        result = await session.execute(select(JobRecord).where(JobRecord.share_id == share_id))
        return result.scalar_one_or_none()
