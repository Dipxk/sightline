export type Vertical = "hotel" | "clinic" | "retail" | "property" | "other";

export interface VisionMoment {
  id: string;
  title: string;
  description: string;
  evidence: string;
  voice_only_failure: string;
  multimodal_success: string;
  vision_trigger: string | null;
  actions: string[];
}

export interface Integration {
  name: string;
  category: string;
  confidence: number;
  reason: string;
}

export interface BusinessProfile {
  name: string;
  url: string;
  vertical: Vertical;
  location: string | null;
  tagline: string | null;
  hours_summary: string | null;
  after_hours_gap: boolean;
  bilingual: boolean;
  facts: string[];
  vision_moments: VisionMoment[];
  integrations: Integration[];
  voice_only_score: number;
  multimodal_score: number;
}

export interface StreamEvent {
  id: string;
  type: string;
  timestamp: string;
  data: Record<string, unknown>;
}

export interface SimulationTick {
  path: "voice_only" | "multimodal";
  moment_id: string;
  phase: string;
  utterance?: { speaker: string; text: string };
  vision_label?: string;
  vision_detail?: string;
  action?: { label: string; status: string; system: string };
  is_final?: boolean;
}

export interface AnalysisState {
  status: "idle" | "analyzing" | "simulating" | "complete";
  progress: string[];
  profile: BusinessProfile | null;
  moments: VisionMoment[];
  integrations: Integration[];
  voiceTicks: SimulationTick[];
  multiTicks: SimulationTick[];
  shareId: string | null;
  activeMomentId: string | null;
}
