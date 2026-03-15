import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          yellow: "#F5C800",
          yellowHover: "#E0B800",
          green: "#2D6A4F",
          cream: "#FFFDF4",
          card: "#FFFFFF",
          border: "#E8E2D0",
          text: "#1A1A1A",
          muted: "#6B6B6B",
        },
      },
      fontFamily: {
        sans: ["var(--font-nunito)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;