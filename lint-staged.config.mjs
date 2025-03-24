// lint-staged.config.mjs
export default {
  // Use simple glob pattern to match all TypeScript files
  "*.{ts,tsx}": (files) => {
    const filesList = files.join(" ");
    return [`biome format --write ${filesList}`, `biome check ${filesList}`];
  },
};
