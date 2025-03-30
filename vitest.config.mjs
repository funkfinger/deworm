import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.js"],
    include: ["./tests/unit/**/*.{test,spec}.{js,ts,jsx,tsx}"],
    exclude: ["./tests/e2e/**/*", "./tests/test-results/**/*", "node_modules"],
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
