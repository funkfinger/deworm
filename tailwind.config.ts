import type { Config } from "tailwindcss";
// Importing the plugin without 'require'
// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment
const daisyui = require("daisyui");

const config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "var(--primary)",
        "primary-foreground": "var(--primary-foreground)",
        secondary: "var(--secondary)",
        "secondary-foreground": "var(--secondary-foreground)",
        accent: "var(--accent)",
        "accent-foreground": "var(--accent-foreground)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
      },
    },
  },
  // @ts-expect-error - DaisyUI plugin options
  daisyui: {
    themes: [
      {
        light: {
          primary: "#1DB954", // Spotify green
          "primary-content": "#ffffff",
          secondary: "#191414", // Spotify black
          "secondary-content": "#ffffff",
          accent: "#FF7EB9", // Pink for mascot
          "accent-content": "#171717",
          neutral: "#2a2a2a",
          "neutral-content": "#ffffff",
          "base-100": "#ffffff",
          "base-200": "#f8f8f8",
          "base-300": "#ebebeb",
          "base-content": "#171717",
          info: "#3abff8",
          success: "#36d399",
          warning: "#fbbd23",
          error: "#f87272",
        },
        dark: {
          primary: "#1DB954", // Same Spotify green
          "primary-content": "#ffffff",
          secondary: "#191414", // Same Spotify black
          "secondary-content": "#ffffff",
          accent: "#FF7EB9", // Same pink
          "accent-content": "#171717",
          neutral: "#1f1f1f",
          "neutral-content": "#ffffff",
          "base-100": "#0a0a0a",
          "base-200": "#171717",
          "base-300": "#262626",
          "base-content": "#ededed",
          info: "#3abff8",
          success: "#36d399",
          warning: "#fbbd23",
          error: "#f87272",
        },
      },
    ],
    darkTheme: "dark",
  },
  plugins: [daisyui],
} satisfies Config;

export default config;
