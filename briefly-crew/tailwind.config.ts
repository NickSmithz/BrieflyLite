import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        crew: {
          bg: "#070A1A",
          card: "#11162A",
          accent: "#6D4CFF",
          accentSoft: "#8B7CFF",
          muted: "#9CA3AF",
          danger: "#EF4444",
          success: "#22C55E",
          warning: "#F59E0B"
        }
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(109, 76, 255, 0.22), 0 18px 48px rgba(0, 0, 0, 0.28)"
      }
    }
  },
  plugins: []
} satisfies Config;
