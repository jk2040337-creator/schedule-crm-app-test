import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        cream: "#FBF7F0",
        paper: "#FFFFFF",
        ink: "#3A342E",
        muted: "#8A8178",
        peach: {
          50: "#FFF6EF",
          100: "#FFE9D6",
          200: "#FFD3AD",
          400: "#FFA35C",
          500: "#FF8A3D",
          600: "#F5722A",
        },
        sage: {
          50: "#F1F6EF",
          100: "#DEEBD9",
          400: "#8FB77E",
          500: "#6FA35B",
        },
        sky: {
          50: "#EEF5FA",
          100: "#D7E9F5",
          400: "#6FA8C9",
          500: "#4E8FB3",
        },
        sand: {
          50: "#F7F2EA",
          100: "#EFE5D5",
          200: "#E2D2B8",
        },
      },
      borderRadius: {
        xl2: "1.25rem",
        card: "1.5rem",
      },
      boxShadow: {
        soft: "0 2px 12px rgba(58, 52, 46, 0.06)",
        card: "0 4px 20px rgba(58, 52, 46, 0.08)",
      },
      fontFamily: {
        sans: [
          "Pretendard",
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
