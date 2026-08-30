"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getArtifact } from "@/lib/api";
import type { BusinessProfile } from "@/lib/types";
import { ProfileCard } from "@/components/ProfileCard";
import { MomentList } from "@/components/MomentList";
import { IntegrationMap } from "@/components/IntegrationMap";
import Link from "next/link";

export default function SharePage() {
  const params = useParams();
  const shareId = params.shareId as string;
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeMoment, setActiveMoment] = useState<string | null>(null);

  useEffect(() => {
    getArtifact(shareId)
      .then((data) => {
        setProfile(data.profile);
        if (data.profile.vision_moments.length > 0) {
          setActiveMoment(data.profile.vision_moments[0].id);
        }
      })
      .catch(() => setError("Not found"));
  }, [shareId]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-ink-faint mb-4 font-mono text-sm">{error}</p>
          <Link href="/" className="text-sm text-ink-soft hover:text-ink">
            ← sightline
          </Link>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="font-mono text-xs text-ink-faint">loading</span>
      </div>
    );
  }

  return (
    <main className="min-h-screen">
      <header className="border-b border-border px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-baseline justify-between">
          <Link href="/" className="font-mono text-sm text-ink hover:text-ink-soft">
            sightline
          </Link>
          <span className="text-xs font-mono text-ink-faint">{shareId}</span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        <ProfileCard profile={profile} />

        <MomentList
          moments={profile.vision_moments}
          activeId={activeMoment}
          onSelect={setActiveMoment}
        />

        <IntegrationMap integrations={profile.integrations} />
      </div>
    </main>
  );
}
