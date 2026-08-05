import { describe, expect, it } from "vitest";
import {
  type CreateTicketFields,
  validateCreateTicketFields,
} from "./ticket-fields";

function fields(
  overrides: Partial<CreateTicketFields> = {},
): CreateTicketFields {
  return {
    title: "Printer offline",
    description: "Cannot print from the office PC.",
    type: "FIX_PROBLEM",
    priority: "MEDIUM",
    ...overrides,
  };
}

describe("validateCreateTicketFields", () => {
  it("rejects a ticket with a missing title", () => {
    expect(validateCreateTicketFields(fields({ title: "" }))).toEqual({
      error: "Title is required",
    });
  });

  it("rejects a ticket with a missing description", () => {
    expect(validateCreateTicketFields(fields({ description: "" }))).toEqual({
      error: "Description is required",
    });
  });

  it("rejects a ticket with its title over 200 characters", () => {
    expect(
      validateCreateTicketFields(fields({ title: "T".repeat(201) })),
    ).toEqual({
      error: "Title must be 200 characters or less",
    });
  });

  it("rejects a ticket with an unsupported priority", () => {
    expect(validateCreateTicketFields(fields({ priority: "Now" }))).toEqual({
      error: "Invalid ticket priority",
    });
  });

  it("rejects a ticket with an unsupported type", () => {
    expect(validateCreateTicketFields(fields({ type: "Test" }))).toEqual({
      error: "Invalid ticket type",
    });
  });
});
