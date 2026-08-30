"use client";

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
    <div className="w-full">
      <form onSubmit={handleSubmit} className="flex gap-2 border-b border-border pb-3">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="prospect-site.com"
          disabled={loading}
          className="flex-1 bg-transparent text-ink placeholder:text-ink-faint
            focus:outline-none font-mono text-[15px] disabled:opacity-40"
          spellCheck={false}
        />
        <button
          type="submit"
          disabled={loading || !url.trim()}
          className="px-4 py-1.5 text-sm text-ink border border-border-strong
            hover:bg-bg-raised transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {loading ? "Running…" : "Run"}
        </button>
      </form>

      <p className="mt-3 text-sm text-ink-faint">
        Examples:{" "}
        {DEMO_URLS.map((demo, i) => (
          <span key={demo.slug}>
            {i > 0 && " · "}
            <button
              type="button"
              onClick={() => onSubmit(demo.url, demo.slug)}
              disabled={loading}
              className="font-mono text-ink-soft hover:text-ink underline-offset-2 hover:underline disabled:opacity-40"
            >
              {demo.url}
            </button>
          </span>
        ))}
      </p>
    </div>
  );
}
