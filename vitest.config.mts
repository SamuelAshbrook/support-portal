import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const root = fileURLToPath(new URL("./", import.meta.url));

export default defineConfig({
  test: {
    environment: "node",
    // Explicit root avoids Windows drive-letter path mismatches (vitest#5251).
    root,
  },
  resolve: {
    alias: {
      "@": root,
    },
  },
});
