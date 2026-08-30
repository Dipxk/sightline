"use client";

import { motion } from "framer-motion";

interface ShareBarProps {
  shareId: string;
  onReset: () => void;
}

export function ShareBar({ shareId, onReset }: ShareBarProps) {
  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/share/${shareId}`
      : `/share/${shareId}`;

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4"
    >
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted mb-1">Shareable artifact</p>
        <p className="text-sm text-text-secondary font-mono truncate">{shareUrl}</p>
      </div>
      <div className="flex gap-2 shrink-0">
        <button
          onClick={copyLink}
          className="px-4 py-2 text-sm font-medium bg-accent/10 text-accent border border-accent/20
            rounded-xl hover:bg-accent/20 transition-colors"
        >
          Copy link
        </button>
        <button
          onClick={onReset}
          className="px-4 py-2 text-sm text-text-secondary hover:text-text transition-colors"
        >
          New analysis
        </button>
      </div>
    </motion.div>
  );
}
