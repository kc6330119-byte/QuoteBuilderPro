import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#19201d",
        coal: "#2d3430",
        paper: "#f7f6f1",
        mist: "#e6ebe6",
        line: "#d8ddd5",
        teal: {
          50: "#ecfdfa",
          100: "#ccfbf1",
          600: "#0f766e",
          700: "#0f5f59",
          900: "#113f3b"
        },
        brass: "#b8860b",
        coral: "#c75d45"
      },
      fontFamily: {
        sans: ["Aptos", "SF Pro Text", "Segoe UI", "sans-serif"],
        display: ["Aptos Display", "SF Pro Display", "Segoe UI", "sans-serif"],
        mono: ["Berkeley Mono", "SFMono-Regular", "Consolas", "monospace"]
      },
      boxShadow: {
        soft: "0 16px 50px rgba(25, 32, 29, 0.08)",
        crisp: "0 1px 0 rgba(25, 32, 29, 0.08), 0 12px 24px rgba(25, 32, 29, 0.08)"
      },
      keyframes: {
        rise: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        shimmer: {
          "0%": { transform: "translateX(-30%)" },
          "100%": { transform: "translateX(30%)" }
        }
      },
      animation: {
        rise: "rise 600ms ease-out both",
        shimmer: "shimmer 9s ease-in-out infinite alternate"
      }
    }
  },
  plugins: []
};

export default config;
