"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { SimulationTick } from "@/lib/types";

interface SimulationPaneProps {
  title: string;
  subtitle: string;
  variant: "voice_only" | "multimodal";
  ticks: SimulationTick[];
  momentId: string | null;
}

export function SimulationPane({
  title,
  subtitle,
  variant,
  ticks,
  momentId,
}: SimulationPaneProps) {
  const filtered = momentId
    ? ticks.filter((t) => t.moment_id === momentId)
    : ticks;

  const isVoice = variant === "voice_only";
  const borderColor = isVoice ? "border-danger/20" : "border-success/20";
  const headerBg = isVoice ? "bg-danger/5" : "bg-success/5";
  const dotColor = isVoice ? "bg-danger" : "bg-success";

  const hasFailed = filtered.some((t) => t.phase === "failure");
  const hasSucceeded = filtered.some((t) => t.phase === "success");

  return (
    <div className={`rounded-2xl border ${borderColor} overflow-hidden flex flex-col h-full`}>
      <div className={`px-4 py-3 ${headerBg} border-b ${borderColor}`}>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${dotColor}`} />
          <span className="text-sm font-medium text-text">{title}</span>
        </div>
        <p className="text-xs text-text-secondary mt-0.5">{subtitle}</p>
      </div>

      <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[400px] min-h-[280px]">
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-muted text-center py-8"
            >
              Waiting for simulation…
            </motion.p>
          )}

          {filtered.map((tick, i) => (
            <motion.div
              key={`${tick.moment_id}-${tick.phase}-${i}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              {tick.utterance && tick.utterance.speaker !== "system" && (
                <UtteranceBubble
                  speaker={tick.utterance.speaker}
                  text={tick.utterance.text}
                  variant={variant}
                />
              )}

              {tick.phase === "vision" && tick.vision_label && (
                <VisionEvent
                  label={tick.vision_label}
                  detail={tick.vision_detail}
                />
              )}

              {tick.action && (
                <ActionEvent action={tick.action} />
              )}

              {tick.phase === "failure" && (
                <StatusBadge type="failure" text="Call unresolved — customer must wait" />
              )}

              {tick.phase === "success" && (
                <StatusBadge type="success" text="Resolved in single call" />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {(hasFailed || hasSucceeded) && (
        <div className={`px-4 py-2 border-t ${borderColor} ${headerBg}`}>
          <p className={`text-xs font-medium ${hasFailed ? "text-danger" : "text-success"}`}>
            {hasFailed ? "✗ Workflow incomplete" : "✓ Workflow complete"}
          </p>
        </div>
      )}
    </div>
  );
}

function UtteranceBubble({
  speaker,
  text,
  variant,
}: {
  speaker: string;
  text: string;
  variant: "voice_only" | "multimodal";
}) {
  const isAgent = speaker === "agent";
  const isCustomer = speaker === "customer";

  return (
    <div className={`flex ${isAgent ? "justify-start" : "justify-end"} mb-2`}>
      <div
        className={`max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
          isAgent
            ? "bg-bg-elevated text-text border border-border"
            : isCustomer
            ? variant === "multimodal"
              ? "bg-success/10 text-text border border-success/20"
              : "bg-danger/10 text-text border border-danger/20"
            : "bg-bg-elevated text-muted"
        }`}
      >
        <span className="text-[10px] uppercase tracking-wider text-muted block mb-0.5">
          {speaker}
        </span>
        {text}
      </div>
    </div>
  );
}

function VisionEvent({ label, detail }: { label: string; detail?: string }) {
  return (
    <div className="my-2 px-3 py-2 bg-accent/5 border border-accent/20 rounded-lg">
      <div className="flex items-center gap-2 text-xs text-accent font-medium">
        <span>👁</span> {label}
      </div>
      {detail && (
        <p className="text-xs text-text-secondary mt-1">{detail}</p>
      )}
    </div>
  );
}

function ActionEvent({ action }: { action: { label: string; status: string; system: string } }) {
  return (
    <div className="flex items-center gap-2 my-1.5 text-xs">
      <span className={`w-1.5 h-1.5 rounded-full ${
        action.status === "done" ? "bg-success" : "bg-accent animate-pulse-soft"
      }`} />
      <span className="text-text-secondary">
        <span className="text-text font-medium">{action.label}</span>
        <span className="text-muted"> → {action.system}</span>
      </span>
    </div>
  );
}

function StatusBadge({ type, text }: { type: "failure" | "success"; text: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`mt-3 px-3 py-2 rounded-lg text-xs font-medium text-center ${
        type === "failure"
          ? "bg-danger/10 text-danger border border-danger/20"
          : "bg-success/10 text-success border border-success/20"
      }`}
    >
      {text}
    </motion.div>
  );
}
