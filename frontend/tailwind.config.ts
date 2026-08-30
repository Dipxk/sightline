import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#09090b",
          card: "#111113",
          elevated: "#18181b",
        },
        border: {
          DEFAULT: "#27272a",
          subtle: "#1f1f23",
        },
        accent: {
          DEFAULT: "#a78bfa",
          muted: "#7c3aed",
          glow: "rgba(167, 139, 250, 0.15)",
        },
        success: "#34d399",
        danger: "#f87171",
        muted: "#71717a",
        text: {
          DEFAULT: "#fafafa",
          secondary: "#a1a1aa",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
