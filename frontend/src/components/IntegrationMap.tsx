"use client";

import { motion } from "framer-motion";
import type { Integration } from "@/lib/types";

interface IntegrationMapProps {
  integrations: Integration[];
}

export function IntegrationMap({ integrations }: IntegrationMapProps) {
  if (integrations.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass rounded-2xl p-5"
    >
      <h3 className="text-xs font-medium text-muted uppercase tracking-wider mb-4">
        Likely integrations
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {integrations.map((int) => (
          <div
            key={int.name}
            className="flex items-center gap-3 p-3 bg-bg-elevated rounded-xl border border-border-subtle"
          >
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent text-sm">
              ⚡
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-text truncate">{int.name}</p>
              <p className="text-xs text-muted">{int.category}</p>
            </div>
            <span className="ml-auto text-xs text-text-secondary shrink-0">
              {Math.round(int.confidence * 100)}%
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
