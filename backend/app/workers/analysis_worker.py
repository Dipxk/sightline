from __future__ import annotations

from typing import Optional
import asyncio
import uuid
import json
from app.core.events import EventType, StreamEvent
from app.core.config import settings
from app.scraper.extractors import scrape_url
from app.analysis.pipeline import analyze_scrape
from app.analysis.schemas import BusinessProfile
from app.simulation.orchestrator import SimulationOrchestrator
from app.db.models import save_job, update_job


async def run_analysis(
    job_id: str,
    share_id: str,
    url: str,
    demo_slug: Optional[str],
    event_queue: asyncio.Queue,
):
    await save_job(job_id, share_id, url, status="running")

    await event_queue.put(
        StreamEvent(type=EventType.ANALYSIS_STARTED, data={"job_id": job_id, "url": url})
    )

    progress_steps = [
        "Fetching website…",
        "Extracting business context…",
        "Mapping customer workflows…",
        "Identifying vision-critical moments…",
        "Inferring integrations…",
    ]

    scrape_task = asyncio.create_task(scrape_url(url))

    for step in progress_steps[:2]:
        await event_queue.put(
            StreamEvent(type=EventType.ANALYSIS_PROGRESS, data={"message": step})
        )
        await asyncio.sleep(0.4)

    scrape = await scrape_task

    await event_queue.put(
        StreamEvent(type=EventType.ANALYSIS_PROGRESS, data={"message": progress_steps[2]})
    )
    await asyncio.sleep(0.3)

    profile = await analyze_scrape(scrape, demo_slug)

    await event_queue.put(
        StreamEvent(
            type=EventType.FACT_EXTRACTED,
            data={
                "name": profile.name,
                "vertical": profile.vertical.value,
                "location": profile.location,
                "tagline": profile.tagline,
                "hours_summary": profile.hours_summary,
                "after_hours_gap": profile.after_hours_gap,
                "bilingual": profile.bilingual,
                "facts": profile.facts,
                "voice_only_score": profile.voice_only_score,
                "multimodal_score": profile.multimodal_score,
            },
        )
    )
    await asyncio.sleep(0.35)

    for moment in profile.vision_moments:
        await event_queue.put(
            StreamEvent(
                type=EventType.MOMENT_DETECTED,
                data=moment.model_dump(),
            )
        )
        await asyncio.sleep(0.25)

    for integration in profile.integrations:
        await event_queue.put(
            StreamEvent(
                type=EventType.INTEGRATION_FOUND,
                data=integration.model_dump(),
            )
        )
        await asyncio.sleep(0.15)

    await event_queue.put(
        StreamEvent(
            type=EventType.ANALYSIS_COMPLETE,
            data={"profile": profile.model_dump(), "share_id": share_id},
        )
    )

    await update_job(job_id, json.dumps(profile.model_dump()), status="complete")

    # Simulation
    await event_queue.put(
        StreamEvent(type=EventType.SIMULATION_STARTED, data={"moment_count": len(profile.vision_moments)})
    )

    orchestrator = SimulationOrchestrator(profile)
    async for tick in orchestrator.generate_ticks():
        await event_queue.put(
            StreamEvent(
                type=EventType.SIMULATION_TICK,
                data=tick.model_dump(),
            )
        )

    await event_queue.put(StreamEvent(type=EventType.SIMULATION_COMPLETE, data={"job_id": job_id}))
    await event_queue.put(None)  # sentinel
