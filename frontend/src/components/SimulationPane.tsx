"use client";

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
  const hasFailed = filtered.some((t) => t.phase === "failure");
  const hasSucceeded = filtered.some((t) => t.phase === "success");

  return (
    <div className="panel flex flex-col h-full min-h-[320px]">
      <div className="px-4 py-3 border-b border-border">
        <p className="text-sm text-ink">{title}</p>
        <p className="text-xs text-ink-faint mt-0.5 font-mono">{subtitle}</p>
      </div>

      <div className="flex-1 p-4 space-y-2 overflow-y-auto max-h-[380px] font-mono text-xs leading-relaxed">
        {filtered.length === 0 && (
          <p className="text-ink-faint py-6">waiting for replay…</p>
        )}

        {filtered.map((tick, i) => (
          <div key={`${tick.moment_id}-${tick.phase}-${i}`}>
            {tick.utterance && tick.utterance.speaker !== "system" && (
              <div className="mb-2">
                <span className="text-ink-faint">{tick.utterance.speaker}</span>
                <p className="text-ink-soft mt-0.5">{tick.utterance.text}</p>
              </div>
            )}

            {tick.phase === "vision" && tick.vision_label && (
              <div className="my-2 pl-3 border-l border-border-strong">
                <p className="text-ink-faint">[vision] {tick.vision_label}</p>
                {tick.vision_detail && (
                  <p className="text-ink-soft mt-1">{tick.vision_detail}</p>
                )}
              </div>
            )}

            {tick.action && (
              <p className="text-ink-faint my-1">
                → {tick.action.label}
                <span className="text-ink-faint/70"> ({tick.action.system})</span>
              </p>
            )}

            {tick.phase === "failure" && (
              <p className="mt-3 text-fail border-t border-border pt-2">
                unresolved — customer waits or calls back
              </p>
            )}

            {tick.phase === "success" && (
              <p className="mt-3 text-ok border-t border-border pt-2">
                closed in one call
              </p>
            )}
          </div>
        ))}
      </div>

      {(hasFailed || hasSucceeded) && (
        <div className="px-4 py-2 border-t border-border text-xs font-mono">
          <span className={hasFailed ? "text-fail" : "text-ok"}>
            {hasFailed ? "outcome: dropped" : "outcome: resolved"}
          </span>
          {isVoice && hasFailed && (
            <span className="text-ink-faint"> — no camera path</span>
          )}
        </div>
      )}
    </div>
  );
}
