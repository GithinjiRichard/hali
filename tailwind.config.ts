import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Light theme (default)
        background: "#f6f7fb",
        surface: "#ffffff",
        surfaceLight: "#f0f2f7",
        border: "#e4e7ef",
        primary: "#16a34a",
        danger: "#dc2626",
        accent: "#2563eb",
        muted: "#667085",

        // Dark theme counterparts (activated via the `dark:` variant)
        backgroundDark: "#0b0e14",
        surfaceDark: "#11151f",
        surfaceLightDark: "#161b29",
        borderDark: "#222838",
        primaryDark: "#22c55e",
        dangerDark: "#ef4444",
        accentDark: "#3b82f6",
        mutedDark: "#7d869c",
      },
      fontFamily: {
        sans: ["var(--font-body)", "Inter", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
        mono: ["var(--font-data)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(16,24,40,0.06), 0 1px 2px -1px rgba(16,24,40,0.06)",
        cardDark: "0 1px 3px 0 rgba(0,0,0,0.4), 0 1px 2px -1px rgba(0,0,0,0.3)",
        glow: "0 0 0 1px rgba(22,163,74,0.08), 0 8px 24px -8px rgba(22,163,74,0.25)",
      },
      backgroundImage: {
        grain:
          "radial-gradient(circle at 1px 1px, rgba(0,0,0,0.035) 1px, transparent 0)",
      },
    },
  },
  plugins: [],
};

export default config;
