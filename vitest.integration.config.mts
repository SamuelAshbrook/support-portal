import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const root = fileURLToPath(new URL("./", import.meta.url));

export default defineConfig({
  test: {
    environment: "node",
    root,
    fileParallelism: false,
    testTimeout: 30_000,
    include: ["**/*.integration.test.ts"],
    setupFiles: ["./tests/integration/setup-env.ts"],
  },
  resolve: {
    alias: {
      "@": root,
    },
  },
});
