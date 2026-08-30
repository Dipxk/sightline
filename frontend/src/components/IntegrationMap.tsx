"use client";

import type { Integration } from "@/lib/types";

interface IntegrationMapProps {
  integrations: Integration[];
}

export function IntegrationMap({ integrations }: IntegrationMapProps) {
  if (integrations.length === 0) return null;

  return (
    <div className="panel px-5 py-4">
      <p className="text-xs font-mono text-ink-faint uppercase tracking-wide mb-3">
        Systems to wire
      </p>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
        {integrations.map((int) => (
          <li key={int.name} className="flex justify-between gap-4 text-sm">
            <span className="text-ink">{int.name}</span>
            <span className="text-ink-faint font-mono text-xs shrink-0">
              {int.category}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
