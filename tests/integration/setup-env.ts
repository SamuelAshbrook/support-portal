import { config } from "dotenv";
import { resolve } from "node:path";

config({ path: resolve(process.cwd(), ".env.test") });

if (!process.env.DATABASE_URL?.trim()) {
  throw new Error(
    "DATABASE_URL is missing or empty after loading .env.test. " +
      "Add DATABASE_URL to .env.test before running integration tests.",
  );
}
