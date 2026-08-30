"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { DEMO_URLS } from "@/lib/api";

interface UrlInputProps {
  onSubmit: (url: string, demoSlug?: string) => void;
  loading: boolean;
}

export function UrlInput({ onSubmit, loading }: UrlInputProps) {
  const [url, setUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) onSubmit(url.trim());
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste a prospect's website…"
          disabled={loading}
          className="w-full h-14 px-5 pr-32 bg-bg-elevated border border-border rounded-2xl
            text-text placeholder:text-muted text-[15px]
            focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20
            transition-all duration-200 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading || !url.trim()}
          className="absolute right-2 top-2 h-10 px-5 bg-accent hover:bg-accent-muted
            text-white text-sm font-medium rounded-xl
            transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? "Analyzing…" : "Analyze"}
        </button>
      </form>

      <div className="flex flex-wrap gap-2 mt-4 justify-center">
        {DEMO_URLS.map((demo) => (
          <button
            key={demo.slug}
            onClick={() => onSubmit(demo.url, demo.slug)}
            disabled={loading}
            className="px-3 py-1.5 text-xs text-text-secondary bg-bg-elevated border border-border
              rounded-lg hover:border-accent/30 hover:text-text transition-all duration-200
              disabled:opacity-40"
          >
            {demo.label}
          </button>
        ))}
      </div>
    </div>
  );
}
