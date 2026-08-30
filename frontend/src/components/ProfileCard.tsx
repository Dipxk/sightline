"use client";

import type { BusinessProfile } from "@/lib/types";

const VERTICAL: Record<string, string> = {
  hotel: "Hospitality",
  clinic: "Healthcare",
  retail: "Retail",
  property: "Property",
  other: "Operations",
};

interface ProfileCardProps {
  profile: BusinessProfile;
}

export function ProfileCard({ profile }: ProfileCardProps) {
  const visionCount = profile.vision_moments.length;
  const needsVision = profile.vision_moments.filter((m) => m.vision_trigger).length;

  const signals: string[] = [];
  if (profile.location) signals.push(profile.location);
  signals.push(VERTICAL[profile.vertical] || profile.vertical);
  if (profile.after_hours_gap) signals.push("after-hours phone gap");
  if (profile.bilingual) signals.push("bilingual ops");

  return (
    <div className="panel px-5 py-4">
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
        <div>
          <h2 className="text-lg font-medium text-ink tracking-tight">
            {profile.name}
          </h2>
          {profile.tagline && (
            <p className="text-sm text-ink-soft mt-0.5 max-w-xl">{profile.tagline}</p>
          )}
        </div>
        <p className="text-sm font-mono text-ink-faint shrink-0">
          {signals.join(" · ")}
        </p>
      </div>

      <p className="mt-4 text-sm text-ink-soft border-t border-border pt-4">
        <span className="text-ink font-medium">{needsVision} of {visionCount}</span>{" "}
        mapped workflows require live vision.
        {profile.after_hours_gap && (
          <> Phone coverage appears thinner than digital — callers likely hit voicemail after hours.</>
        )}
      </p>
    </div>
  );
}
