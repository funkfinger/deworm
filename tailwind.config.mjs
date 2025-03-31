import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        "patrick-hand": ["var(--font-patrick-hand)", "cursive"],
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: ["retro"],
    base: true,
    styled: true,
    utils: true,
    prefix: "",
    logs: true,
    themeRoot: ":root",
  },
  experimental: {
    optimizeUniversalDefaults: true,
  },
};
