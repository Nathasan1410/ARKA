import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        neu: {
          bg: "#E0E5EC",
          foreground: "#1F2937", // Darkened for AAA contrast (9.3:1)
          muted: "#4B5563",      // Darkened for AA contrast (6.1:1)
          accent: "#4F46E5",     // Indigo-600 for AA contrast on White (6.4:1)
          accentLight: "#6366F1", 
          secondary: "#0F766E",  // Teal-700 for AA contrast on White (6.2:1)
        },
      },
      boxShadow: {
        extruded: "9px 9px 16px rgb(163,177,198,0.6), -9px -9px 16px rgba(255,255,255,0.5)",
        "extruded-hover": "12px 12px 20px rgb(163,177,198,0.7), -12px -12px 20px rgba(255,255,255,0.6)",
        "extruded-sm": "5px 5px 10px rgb(163,177,198,0.6), -5px -5px 10px rgba(255,255,255,0.5)",
        inset: "inset 6px 6px 10px rgb(163,177,198,0.6), inset -6px -6px 10px rgba(255,255,255,0.5)",
        "inset-deep": "inset 10px 10px 20px rgb(163,177,198,0.7), inset -10px -10px 20px rgba(255,255,255,0.6)",
        "inset-sm": "inset 3px 3px 6px rgb(163,177,198,0.6), inset -3px -3px 6px rgba(255,255,255,0.5)",
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', "sans-serif"],
        sans: ['"DM Sans"', "sans-serif"],
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "24px",
        "4xl": "32px",
      },
      animation: {
        float: "float 4s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
