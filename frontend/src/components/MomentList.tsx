"use client";

import { motion } from "framer-motion";
import type { VisionMoment } from "@/lib/types";

interface MomentListProps {
  moments: VisionMoment[];
  activeId: string | null;
  onSelect: (id: string) => void;
}

export function MomentList({ moments, activeId, onSelect }: MomentListProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-medium text-muted uppercase tracking-wider">
        Vision-critical moments
      </h3>
      {moments.map((moment, i) => (
        <motion.button
          key={moment.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          onClick={() => onSelect(moment.id)}
          className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
            activeId === moment.id
              ? "bg-accent/5 border-accent/30"
              : "bg-bg-card border-border hover:border-border"
          }`}
        >
          <div className="flex items-start gap-3">
            <span className="shrink-0 w-6 h-6 flex items-center justify-center text-xs font-mono bg-bg-elevated rounded-md text-accent">
              {i + 1}
            </span>
            <div>
              <p className="text-sm font-medium text-text">{moment.title}</p>
              <p className="text-xs text-text-secondary mt-1 line-clamp-2">
                {moment.description}
              </p>
              {moment.vision_trigger && (
                <p className="text-xs text-accent mt-2 flex items-center gap-1">
                  <span>👁</span> {moment.vision_trigger}
                </p>
              )}
            </div>
          </div>
        </motion.button>
      ))}
    </div>
  );
}
