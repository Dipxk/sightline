"use client";

import { motion } from "framer-motion";
import type { BusinessProfile } from "@/lib/types";

const VERTICAL_LABELS: Record<string, string> = {
  hotel: "Hotel & F&B",
  clinic: "Clinic & Healthcare",
  retail: "Retail & Support",
  property: "Property Management",
  other: "Customer Operations",
};

interface ProfileCardProps {
  profile: BusinessProfile;
}

export function ProfileCard({ profile }: ProfileCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass rounded-2xl p-6 glow-accent"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-text">{profile.name}</h2>
          {profile.tagline && (
            <p className="text-sm text-text-secondary mt-1">{profile.tagline}</p>
          )}
        </div>
        <span className="shrink-0 px-3 py-1 text-xs font-medium bg-accent/10 text-accent rounded-full border border-accent/20">
          {VERTICAL_LABELS[profile.vertical] || profile.vertical}
        </span>
      </div>

      <div className="flex flex-wrap gap-2 mt-4">
        {profile.location && (
          <Tag icon="📍">{profile.location}</Tag>
        )}
        {profile.bilingual && <Tag icon="🌐">Bilingual</Tag>}
        {profile.after_hours_gap && (
          <Tag icon="🌙">After-hours gap</Tag>
        )}
        {profile.hours_summary && (
          <Tag icon="🕐">{profile.hours_summary}</Tag>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6">
        <ScoreBar
          label="Voice-only coverage"
          score={profile.voice_only_score}
          color="danger"
        />
        <ScoreBar
          label="Multimodal coverage"
          score={profile.multimodal_score}
          color="success"
        />
      </div>
    </motion.div>
  );
}

function Tag({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs text-text-secondary bg-bg-elevated rounded-lg border border-border-subtle">
      <span>{icon}</span>
      {children}
    </span>
  );
}

function ScoreBar({
  label,
  score,
  color,
}: {
  label: string;
  score: number;
  color: "danger" | "success";
}) {
  const barColor = color === "danger" ? "bg-danger" : "bg-success";
  const textColor = color === "danger" ? "text-danger" : "text-success";

  return (
    <div>
      <div className="flex justify-between items-baseline mb-2">
        <span className="text-xs text-text-secondary">{label}</span>
        <span className={`text-lg font-semibold ${textColor}`}>{score}%</span>
      </div>
      <div className="h-1.5 bg-bg-elevated rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
          className={`h-full rounded-full ${barColor}`}
        />
      </div>
    </div>
  );
}
