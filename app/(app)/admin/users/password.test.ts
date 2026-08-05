import { describe, expect, it } from "vitest";
import { validatePassword } from "./password";

describe("validatePassword", () => {
  it("accepts a valid password that meets the requirements", () => {
    expect(validatePassword("rzn5fpr5wdt@kgt5FYP")).toBeNull();
  });

  it("rejects a password that has less than 8 characters", () => {
    expect(validatePassword("rzn5fp")).toBe(
      "Password must be at least 8 characters",
    );
  });

  it("rejects a password without a number", () => {
    expect(validatePassword("rznfprwdt")).toBe(
      "Password must contain at least one number",
    );
  });

  it("rejects a password without a symbol", () => {
    expect(validatePassword("rzn5fpr5wdt")).toBe(
      "Password must contain at least one symbol",
    );
  });
});
