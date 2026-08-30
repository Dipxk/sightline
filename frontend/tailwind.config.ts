import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#090909",
          panel: "#0f0f0f",
          raised: "#141414",
        },
        border: {
          DEFAULT: "#1f1f1f",
          strong: "#2e2e2e",
        },
        ink: {
          DEFAULT: "#ededed",
          soft: "#a3a3a3",
          faint: "#5c5c5c",
        },
        fail: "#b85c5c",
        ok: "#5f9a73",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
