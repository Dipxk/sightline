"use client";

import { useAnalysis } from "@/hooks/useAnalysis";
import { UrlInput } from "@/components/UrlInput";
import { ProgressFeed } from "@/components/ProgressFeed";
import { ProfileCard } from "@/components/ProfileCard";
import { MomentList } from "@/components/MomentList";
import { SimulationPane } from "@/components/SimulationPane";
import { IntegrationMap } from "@/components/IntegrationMap";
import { ShareBar } from "@/components/ShareBar";
import { useState } from "react";

export default function Home() {
  const { state, error, analyze, reset } = useAnalysis();
  const [selectedMoment, setSelectedMoment] = useState<string | null>(null);

  const loading = state.status === "analyzing" || state.status === "simulating";
  const activeMoment = selectedMoment || state.activeMomentId;
  const hasResults = state.status !== "idle";

  return (
    <main className="min-h-screen">
      <header className="border-b border-border px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-baseline justify-between">
          <span className="font-mono text-sm text-ink tracking-tight">sightline</span>
          {hasResults && state.profile && (
            <span className="text-xs font-mono text-ink-faint truncate max-w-[50%]">
              {state.profile.name}
            </span>
          )}
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {!hasResults ? (
          <div className="max-w-xl">
            <h1 className="text-2xl font-medium text-ink tracking-tight leading-snug">
              Where do voice agents fail for this business?
            </h1>
            <p className="mt-3 text-ink-soft leading-relaxed">
              Paste a prospect site. Sightline maps call workflows that need live
              vision — then replays the same moment with and without it.
            </p>
            <div className="mt-8">
              <UrlInput onSubmit={analyze} loading={loading} />
            </div>
            {error && (
              <p className="mt-4 text-sm text-fail">{error}</p>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            <UrlInput onSubmit={analyze} loading={loading} />

            {error && <p className="text-sm text-fail">{error}</p>}

            {state.status === "analyzing" && state.progress.length > 0 && (
              <ProgressFeed messages={state.progress} />
            )}

            {state.profile && (
              <ProfileCard
                profile={{
                  ...state.profile,
                  vision_moments: state.moments,
                  integrations: state.integrations,
                }}
              />
            )}

            {state.moments.length > 0 && (
              <div>
                <p className="text-xs font-mono text-ink-faint uppercase tracking-wide mb-4">
                  Call replay
                </p>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-4">
                    <MomentList
                      moments={state.moments}
                      activeId={activeMoment}
                      onSelect={setSelectedMoment}
                    />
                  </div>
                  <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <SimulationPane
                      title="Voice only"
                      subtitle="no camera"
                      variant="voice_only"
                      ticks={state.voiceTicks}
                      momentId={activeMoment}
                    />
                    <SimulationPane
                      title="Voice + vision"
                      subtitle="same call"
                      variant="multimodal"
                      ticks={state.multiTicks}
                      momentId={activeMoment}
                    />
                  </div>
                </div>
              </div>
            )}

            {state.integrations.length > 0 && (
              <IntegrationMap integrations={state.integrations} />
            )}

            {state.status === "complete" && state.shareId && (
              <ShareBar shareId={state.shareId} onReset={reset} />
            )}
          </div>
        )}
      </div>
    </main>
  );
}
