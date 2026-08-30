"use client";

interface ProgressFeedProps {
  messages: string[];
}

export function ProgressFeed({ messages }: ProgressFeedProps) {
  return (
    <div className="font-mono text-xs text-ink-faint space-y-1.5">
      {messages.map((msg, i) => (
        <p key={`${msg}-${i}`}>
          <span className="text-ink-faint/50 mr-2">—</span>
          {msg}
        </p>
      ))}
    </div>
  );
}
