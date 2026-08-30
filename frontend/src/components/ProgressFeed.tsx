"use client";

import { motion, AnimatePresence } from "framer-motion";

interface ProgressFeedProps {
  messages: string[];
}

export function ProgressFeed({ messages }: ProgressFeedProps) {
  return (
    <div className="space-y-2">
      <AnimatePresence mode="popLayout">
        {messages.map((msg, i) => (
          <motion.div
            key={`${msg}-${i}`}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-3 text-sm text-text-secondary"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-soft" />
            {msg}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
