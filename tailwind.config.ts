import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // ---------------------------------------------------------------
        // Light theme (default) — warm editorial cream & goldenrod, tuned
        // to feel like a considered publication rather than a data
        // terminal. "primary" = good news (green), "danger" = bad news
        // (red), "accent" = brand/CTA (gold).
        // ---------------------------------------------------------------
        background: "#FAF8F4",
        surface: "#FFFFFF",
        surfaceLight: "#F2EFE8",
        border: "#E8E4DC",
        borderLight: "#D6D0C6",
        ink: "#1A1714",
        primary: "#1B7A3D",
        danger: "#C0392B",
        accent: "#B8860B",
        accentLight: "#D4A017",
        warning: "#B8720A",
        muted: "#6B6560",

        // ---------------------------------------------------------------
        // Dark theme counterparts (activated via the `dark:` variant) —
        // warm charcoal, not navy, so the palette feels like one family.
        // ---------------------------------------------------------------
        backgroundDark: "#17140F",
        surfaceDark: "#211D17",
        surfaceLightDark: "#2A241C",
        borderDark: "#3A332A",
        inkDark: "#F5F1EA",
        primaryDark: "#34A65B",
        dangerDark: "#E2604B",
        accentDark: "#E0B23A",
        warningDark: "#E0A23A",
        mutedDark: "#A39C92",
      },
      fontFamily: {
        sans: ["var(--font-body)", "Inter", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
        mono: ["var(--font-data)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(26,23,20,0.06), 0 1px 2px -1px rgba(26,23,20,0.06)",
        cardDark: "0 1px 3px 0 rgba(0,0,0,0.4), 0 1px 2px -1px rgba(0,0,0,0.3)",
        glow: "0 0 0 1px rgba(184,134,11,0.12), 0 8px 24px -8px rgba(184,134,11,0.3)",
        lift: "0 20px 60px rgba(26,23,20,0.08)",
      },
      backgroundImage: {
        grain:
          "radial-gradient(circle at 1px 1px, rgba(26,23,20,0.035) 1px, transparent 0)",
      },
    },
  },
  plugins: [],
};

export default config;
