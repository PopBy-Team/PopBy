import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#FDFBF7",
        ink: "#292824",
        clay: "#D8755A",
        sage: "#7EAA91",
        butter: "#F4E9C9",
      },
      fontFamily: {
        display: ["Iowan Old Style", "Baskerville", "Times New Roman", "serif"],
        sans: ["Inter", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
