import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0c1322",
        "surface-dark": "#070A0F",
        "surface-container-lowest": "#070e1d",
        "surface-container-low": "#141b2b",
        surface: "#191f2f",
        "surface-container": "#191f2f",
        "surface-container-high": "#232a3a",
        "surface-container-highest": "#2e3545",
        "surface-bright": "#323949",
        "on-surface": "#dce2f7",
        "on-surface-variant": "#c7c4d7",
        outline: "#908fa0",
        "outline-variant": "#464554",
        primary: "#c0c1ff",
        "primary-container": "#8083ff",
        "on-primary": "#1000a9",
        "inverse-primary": "#494bd6",
        secondary: "#7bd0ff",
        "secondary-container": "#00a6e0",
        "on-secondary": "#00354a",
        tertiary: "#bdc2ff",
        "tertiary-container": "#7c87f3",
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      keyframes: {
        subtlePulse: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.4", transform: "scale(0.92)" },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "agent-pulse": "subtlePulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        shimmer: "shimmer 2s infinite linear",
      },
    },
  },
  plugins: [],
};

export default config;
