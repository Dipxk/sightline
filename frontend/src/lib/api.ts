import type { BusinessProfile } from "./types";

function resolveApiUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== "undefined") {
    // Local dev: frontend on 3000, backend on 8000
    if (window.location.hostname === "localhost") {
      return "http://localhost:8000";
    }
  }
  return "http://localhost:8000";
}

function resolveWsUrl(): string {
  if (process.env.NEXT_PUBLIC_WS_URL) {
    return process.env.NEXT_PUBLIC_WS_URL;
  }
  const api = resolveApiUrl();
  return api.replace(/^http/, "ws");
}

const API_URL = resolveApiUrl();
const WS_URL = resolveWsUrl();

export async function startAnalysis(url: string, demoSlug?: string) {
  const res = await fetch(`${API_URL}/api/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, demo_slug: demoSlug }),
  });
  if (!res.ok) throw new Error("Failed to start analysis");
  return res.json() as Promise<{ job_id: string; share_id: string }>;
}

export function connectStream(
  jobId: string,
  onEvent: (event: { type: string; data: Record<string, unknown> }) => void,
  onComplete: () => void,
  onError: (err: Error) => void
) {
  const ws = new WebSocket(`${WS_URL}/api/stream/${jobId}`);

  ws.onmessage = (msg) => {
    const event = JSON.parse(msg.data);
    if (event.type === "error") {
      onError(new Error(String(event.data?.message || "Stream error")));
      return;
    }
    onEvent(event);
    if (
      event.type === "simulation.complete" ||
      event.type === "error"
    ) {
      onComplete();
      ws.close();
    }
  };

  ws.onerror = () => onError(new Error("WebSocket connection failed"));
  ws.onclose = () => onComplete();

  return () => ws.close();
}

export async function getArtifact(shareId: string) {
  const res = await fetch(`${API_URL}/api/artifact/${shareId}`);
  if (!res.ok) throw new Error("Artifact not found");
  return res.json() as Promise<{ profile: BusinessProfile; share_id: string }>;
}

export const DEMO_URLS = [
  {
    label: "Hotel Bonaventure",
    url: "hotelbonaventure.com",
    slug: "hotel-bonaventure",
  },
  {
    label: "Clinique Plateau",
    url: "cliniqueplateau.ca",
    slug: "clinic-demo",
  },
];
