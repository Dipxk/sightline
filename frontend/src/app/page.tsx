"use client";

import { motion, AnimatePresence } from "framer-motion";
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

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className={`relative px-6 transition-all duration-500 ${state.status === "idle" ? "pt-20 pb-12" : "pt-8 pb-6"}`}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-accent/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-xs font-medium text-accent uppercase tracking-widest mb-4">
              GTM Intelligence
            </p>
            <h1 className={`font-bold text-text tracking-tight leading-[1.1] transition-all duration-500 ${state.status === "idle" ? "text-4xl sm:text-5xl" : "text-2xl"}`}>
              Sightline
            </h1>
            {state.status === "idle" && (
              <p className="mt-4 text-lg text-text-secondary max-w-xl mx-auto leading-relaxed">
                Paste a prospect&apos;s website. See where voice-only agents fail —
                and what a multimodal agent would do instead.
              </p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className={state.status === "idle" ? "mt-10" : "mt-4"}
          >
            <UrlInput onSubmit={analyze} loading={loading} />
          </motion.div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 text-sm text-danger"
            >
              {error}
            </motion.p>
          )}
        </div>
      </section>

      {/* Analysis flow */}
      <AnimatePresence>
        {state.status !== "idle" && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-6 pb-20"
          >
            <div className="max-w-6xl mx-auto space-y-8">
              {/* Progress */}
              {state.status === "analyzing" && state.progress.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="max-w-md mx-auto"
                >
                  <ProgressFeed messages={state.progress} />
                </motion.div>
              )}

              {/* Profile */}
              {state.profile && (
                <ProfileCard profile={{ ...state.profile, vision_moments: state.moments, integrations: state.integrations }} />
              )}

              {/* Moments + Simulation */}
              {state.moments.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-4">
                    <MomentList
                      moments={state.moments}
                      activeId={activeMoment}
                      onSelect={setSelectedMoment}
                    />
                  </div>

                  <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SimulationPane
                      title="Voice-only agent"
                      subtitle="Blind — no vision capability"
                      variant="voice_only"
                      ticks={state.voiceTicks}
                      momentId={activeMoment}
                    />
                    <SimulationPane
                      title="Multimodal agent"
                      subtitle="Voice + vision + action"
                      variant="multimodal"
                      ticks={state.multiTicks}
                      momentId={activeMoment}
                    />
                  </div>
                </div>
              )}

              {/* Integrations */}
              {state.integrations.length > 0 && (
                <IntegrationMap integrations={state.integrations} />
              )}

              {/* Share */}
              {state.status === "complete" && state.shareId && (
                <ShareBar shareId={state.shareId} onReset={reset} />
              )}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Footer */}
      {state.status === "idle" && (
        <footer className="absolute bottom-8 left-0 right-0 text-center">
          <p className="text-xs text-muted">
            Built for Eclatira · Simulated agent behavior · Not affiliated
          </p>
        </footer>
      )}
    </main>
  );
}
