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
      .catch(() => setError("Artifact not found"));
  }, [shareId]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-danger mb-4">{error}</p>
          <Link href="/" className="text-accent text-sm hover:underline">
            ← Back to Sightline
          </Link>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-sm text-muted hover:text-text transition-colors">
            ← Sightline
          </Link>
          <span className="text-xs text-muted font-mono">share/{shareId}</span>
        </div>

        <ProfileCard profile={profile} />

        <MomentList
          moments={profile.vision_moments}
          activeId={activeMoment}
          onSelect={setActiveMoment}
        />

        <IntegrationMap integrations={profile.integrations} />

        <div className="glass rounded-2xl p-6 text-center">
          <p className="text-sm text-text-secondary">
            This artifact identifies where{" "}
            <span className="text-text font-medium">{profile.name}</span> needs
            live vision during customer calls — and which integrations an agent
            would require.
          </p>
          <Link
            href="/"
            className="inline-block mt-4 px-5 py-2.5 bg-accent text-white text-sm font-medium rounded-xl hover:bg-accent-muted transition-colors"
          >
            Analyze another prospect
          </Link>
        </div>
      </div>
    </main>
  );
}
