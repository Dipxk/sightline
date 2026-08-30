from __future__ import annotations

from enum import Enum
from typing import Any
from pydantic import BaseModel, Field
from datetime import datetime, timezone
import uuid


class EventType(str, Enum):
    ANALYSIS_STARTED = "analysis.started"
    ANALYSIS_PROGRESS = "analysis.progress"
    FACT_EXTRACTED = "fact.extracted"
    MOMENT_DETECTED = "moment.detected"
    INTEGRATION_FOUND = "integration.found"
    ANALYSIS_COMPLETE = "analysis.complete"
    SIMULATION_STARTED = "simulation.started"
    SIMULATION_TICK = "simulation.tick"
    SIMULATION_COMPLETE = "simulation.complete"
    ERROR = "error"


class StreamEvent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: EventType
    timestamp: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )
    data: dict[str, Any] = {}
