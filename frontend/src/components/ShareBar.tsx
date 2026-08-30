"use client";

import { useState } from "react";

interface ShareBarProps {
  shareId: string;
  onReset: () => void;
}

export function ShareBar({ shareId, onReset }: ShareBarProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/share/${shareId}`
      : `/share/${shareId}`;

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-2 border-t border-border">
      <p className="flex-1 font-mono text-xs text-ink-soft truncate">{shareUrl}</p>
      <div className="flex gap-3 shrink-0">
        <button
          type="button"
          onClick={copyLink}
          className="text-sm text-ink border border-border-strong px-3 py-1.5 hover:bg-bg-raised transition-colors"
        >
          {copied ? "Copied" : "Copy link"}
        </button>
        <button
          type="button"
          onClick={onReset}
          className="text-sm text-ink-faint hover:text-ink-soft transition-colors py-1.5"
        >
          New run
        </button>
      </div>
    </div>
  );
}
