"use client";

import { useCallback, useState } from "react";
import type { AnalysisState, SimulationTick, VisionMoment, Integration, BusinessProfile } from "@/lib/types";
import { startAnalysis, connectStream } from "@/lib/api";

const initialState: AnalysisState = {
  status: "idle",
  progress: [],
  profile: null,
  moments: [],
  integrations: [],
  voiceTicks: [],
  multiTicks: [],
  shareId: null,
  activeMomentId: null,
};

export function useAnalysis() {
  const [state, setState] = useState<AnalysisState>(initialState);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(async (url: string, demoSlug?: string) => {
    setError(null);
    setState({
      ...initialState,
      status: "analyzing",
    });

    try {
      const { job_id, share_id } = await startAnalysis(url, demoSlug);

      setState((s) => ({ ...s, shareId: share_id }));

      connectStream(
        job_id,
        (event) => {
          setState((s) => {
            const next = { ...s };

            switch (event.type) {
              case "analysis.progress":
                next.progress = [...s.progress, event.data.message as string];
                break;

              case "fact.extracted":
                next.profile = {
                  name: event.data.name as string,
                  url,
                  vertical: event.data.vertical as BusinessProfile["vertical"],
                  location: event.data.location as string | null,
                  tagline: event.data.tagline as string | null,
                  hours_summary: event.data.hours_summary as string | null,
                  after_hours_gap: event.data.after_hours_gap as boolean,
                  bilingual: event.data.bilingual as boolean,
                  facts: event.data.facts as string[],
                  vision_moments: s.moments,
                  integrations: s.integrations,
                  voice_only_score: event.data.voice_only_score as number,
                  multimodal_score: event.data.multimodal_score as number,
                };
                break;

              case "moment.detected": {
                const moment = event.data as unknown as VisionMoment;
                next.moments = [...s.moments, moment];
                if (!next.activeMomentId) {
                  next.activeMomentId = moment.id;
                }
                break;
              }

              case "integration.found":
                next.integrations = [
                  ...s.integrations,
                  event.data as unknown as Integration,
                ];
                break;

              case "analysis.complete":
                next.profile = event.data.profile as BusinessProfile;
                next.status = "simulating";
                break;

              case "simulation.tick": {
                const tick = event.data as unknown as SimulationTick;
                if (tick.path === "voice_only") {
                  next.voiceTicks = [...s.voiceTicks, tick];
                } else {
                  next.multiTicks = [...s.multiTicks, tick];
                }
                next.activeMomentId = tick.moment_id;
                break;
              }

              case "simulation.complete":
                next.status = "complete";
                break;
            }

            return next;
          });
        },
        () => {
          setState((s) => ({ ...s, status: "complete" }));
        },
        (err) => setError(err.message)
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed");
      setState(initialState);
    }
  }, []);

  const reset = useCallback(() => {
    setState(initialState);
    setError(null);
  }, []);

  return { state, error, analyze, reset };
}
