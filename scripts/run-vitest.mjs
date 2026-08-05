import { spawnSync } from "node:child_process";
import process from "node:process";

/**
 * Vitest can fail on Windows when the drive letter in cwd is lowercase
 * (https://github.com/vitest-dev/vitest/issues/5251). Normalize before spawn.
 */
const cwd = process.cwd().replace(/^[a-z]:/, (letter) => letter.toUpperCase());
process.chdir(cwd);

const result = spawnSync("npx", ["vitest", ...process.argv.slice(2)], {
  stdio: "inherit",
  cwd,
  env: process.env,
  shell: true,
});

process.exit(result.status ?? 1);
