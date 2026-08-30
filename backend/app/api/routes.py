from __future__ import annotations

import asyncio
import uuid
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException
from app.analysis.schemas import AnalyzeRequest, AnalyzeResponse, ArtifactResponse, BusinessProfile
from app.workers.analysis_worker import run_analysis
from app.db.models import get_job_by_id, get_job_by_share
import json
from datetime import datetime

router = APIRouter()

# In-memory job queues for WebSocket streaming
job_queues: dict[str, asyncio.Queue] = {}
job_tasks: dict[str, asyncio.Task] = {}


@router.post("/analyze", response_model=AnalyzeResponse)
async def start_analysis(request: AnalyzeRequest):
    job_id = str(uuid.uuid4())
    share_id = str(uuid.uuid4())[:12]

    queue: asyncio.Queue = asyncio.Queue()
    job_queues[job_id] = queue

    task = asyncio.create_task(
        run_analysis(job_id, share_id, request.url, request.demo_slug, queue)
    )
    job_tasks[job_id] = task

    return AnalyzeResponse(job_id=job_id, share_id=share_id)


@router.websocket("/stream/{job_id}")
async def stream_analysis(websocket: WebSocket, job_id: str):
    await websocket.accept()

    queue = job_queues.get(job_id)
    if not queue:
        await websocket.send_json(
            {"type": "error", "data": {"message": "Job not found"}}
        )
        await websocket.close()
        return

    try:
        while True:
            event = await queue.get()
            if event is None:
                break
            await websocket.send_json(event.model_dump())
    except WebSocketDisconnect:
        pass
    finally:
        job_queues.pop(job_id, None)
        job_tasks.pop(job_id, None)


@router.get("/artifact/{share_id}", response_model=ArtifactResponse)
async def get_artifact(share_id: str):
    record = await get_job_by_share(share_id)
    if not record or not record.profile_json:
        raise HTTPException(status_code=404, detail="Artifact not found")

    profile = BusinessProfile(**json.loads(record.profile_json))
    return ArtifactResponse(
        job_id=record.job_id,
        share_id=record.share_id,
        profile=profile,
        created_at=record.created_at,
    )


@router.get("/health")
async def health():
    return {"status": "ok", "service": "sightline"}
