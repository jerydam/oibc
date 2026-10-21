import type { Config } from "tailwindcss";

// Palette taken from the church banner and logo.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0E1A3A",    // body text
        navy: "#0B1F4B",   // brand dark: headers, hero, footer
        royal: "#1D5FD0",  // links, small accents (5.3:1 on white)
        ember: "#D6282B",  // red pill, key actions
        gold: "#F5C518",   // highlight on dark, celebration panels
        steel: "#475A7A",  // secondary text
        mist: "#F3F6FB",   // page background
        rule: "#DCE3EF",   // borders
      },
      fontFamily: {
        display: ["Archivo Variable", "system-ui", "sans-serif"],
        sans: ["Public Sans Variable", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
