from __future__ import annotations

from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field
from datetime import datetime
import uuid


class Vertical(str, Enum):
    HOTEL = "hotel"
    CLINIC = "clinic"
    RETAIL = "retail"
    PROPERTY = "property"
    OTHER = "other"


class VisionMoment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4())[:8])
    title: str
    description: str
    evidence: str
    voice_only_failure: str
    multimodal_success: str
    vision_trigger: Optional[str] = None
    actions: list[str] = []


class Integration(BaseModel):
    name: str
    category: str
    confidence: float = 0.7
    reason: str


class BusinessProfile(BaseModel):
    name: str
    url: str
    vertical: Vertical
    location: Optional[str] = None
    tagline: Optional[str] = None
    hours_summary: Optional[str] = None
    after_hours_gap: bool = False
    bilingual: bool = False
    facts: list[str] = []
    vision_moments: list[VisionMoment] = []
    integrations: list[Integration] = []
    voice_only_score: int = Field(ge=0, le=100, description="% of workflows voice-only can handle")
    multimodal_score: int = Field(ge=0, le=100)


class SimulationUtterance(BaseModel):
    speaker: str  # "agent" | "customer"
    text: str
    delay_ms: int = 1200


class SimulationAction(BaseModel):
    label: str
    status: str  # "pending" | "running" | "done" | "failed"
    system: str


class SimulationTick(BaseModel):
    path: str  # "voice_only" | "multimodal"
    moment_id: str
    phase: str  # "utterance" | "vision" | "action" | "failure" | "success"
    utterance: Optional[SimulationUtterance] = None
    vision_label: Optional[str] = None
    vision_detail: Optional[str] = None
    action: Optional[SimulationAction] = None
    is_final: bool = False


class AnalyzeRequest(BaseModel):
    url: str
    demo_slug: Optional[str] = None


class AnalyzeResponse(BaseModel):
    job_id: str
    share_id: str


class ArtifactResponse(BaseModel):
    job_id: str
    share_id: str
    profile: BusinessProfile
    created_at: datetime
