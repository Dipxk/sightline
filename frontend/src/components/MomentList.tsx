"use client";

import type { VisionMoment } from "@/lib/types";

interface MomentListProps {
  moments: VisionMoment[];
  activeId: string | null;
  onSelect: (id: string) => void;
}

export function MomentList({ moments, activeId, onSelect }: MomentListProps) {
  return (
    <div>
      <p className="text-xs font-mono text-ink-faint uppercase tracking-wide mb-3">
        Workflows
      </p>
      <div className="space-y-1">
        {moments.map((moment, i) => {
          const active = activeId === moment.id;
          return (
            <button
              key={moment.id}
              type="button"
              onClick={() => onSelect(moment.id)}
              className={`w-full text-left px-3 py-3 border transition-colors ${
                active
                  ? "border-border-strong bg-bg-raised"
                  : "border-transparent hover:border-border hover:bg-bg-panel"
              }`}
            >
              <div className="flex gap-3">
                <span className="font-mono text-xs text-ink-faint pt-0.5 w-4">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <p className="text-sm text-ink">{moment.title}</p>
                  <p className="text-xs text-ink-soft mt-1 leading-relaxed">
                    {moment.description}
                  </p>
                  {moment.vision_trigger && (
                    <p className="text-xs font-mono text-ink-faint mt-2">
                      vision: {moment.vision_trigger}
                    </p>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
