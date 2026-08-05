import { describe, expect, it } from "vitest";
import { getTicketStatusDisplay } from "./ticket-status";

describe("getTicketStatusDisplay", () => {
  it("maps ticket status value OPEN to label", () => {
    expect(getTicketStatusDisplay("OPEN").label).toBe("Open");
  });
});
