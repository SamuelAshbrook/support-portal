import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("@/app/lib/session", () => ({
  getSession: vi.fn(),
  requireUser: vi.fn(),
  requireAdmin: vi.fn(),
  assertAdmin: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/app/lib/email/resend", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/app/lib/email/resend")>();
  return {
    ...actual,
    sendEmail: vi.fn().mockResolvedValue(true),
  };
});

import prisma from "@/app/lib/prisma";
import { sendEmail } from "@/app/lib/email/resend";
import { getSession } from "@/app/lib/session";
import { createTicket } from "./actions";

const SUPPORT_INBOX = "support-inbox@step3digital.test";
const suffix = `invalid-notify-${Date.now()}`;

describe("invalid ticket create does not notify inbox (integration)", () => {
  let companyId: string;
  let clientId: string;
  let previousInbox: string | undefined;

  beforeAll(async () => {
    previousInbox = process.env.SUPPORT_INBOX_EMAIL;
    process.env.SUPPORT_INBOX_EMAIL = SUPPORT_INBOX;

    const company = await prisma.company.create({
      data: { name: `Invalid Notify Co ${suffix}`, billingRate: 50 },
    });
    companyId = company.id;

    const client = await prisma.user.create({
      data: {
        email: `invalid-notify-client-${suffix}@example.com`,
        name: "Invalid Notify Client",
        role: "CLIENT",
        companyId: company.id,
      },
    });
    clientId = client.id;
  });

  afterAll(async () => {
    if (previousInbox === undefined) {
      delete process.env.SUPPORT_INBOX_EMAIL;
    } else {
      process.env.SUPPORT_INBOX_EMAIL = previousInbox;
    }

    if (clientId) {
      await prisma.user.deleteMany({ where: { id: clientId } });
    }
    if (companyId) {
      await prisma.company.deleteMany({ where: { id: companyId } });
    }
  });

  it("does not notify the shared support inbox when ticket creation is invalid", async () => {
    vi.mocked(sendEmail).mockClear();

    vi.mocked(getSession).mockResolvedValue({
      user: {
        id: clientId,
        role: "CLIENT",
        companyId,
        email: `invalid-notify-client-${suffix}@example.com`,
        name: "Invalid Notify Client",
      },
    } as Awaited<ReturnType<typeof getSession>>);

    const formData = new FormData();
    formData.set("title", ""); // invalid: missing title
    formData.set("description", "Has a description but no title");
    formData.set("type", "FIX_PROBLEM");
    formData.set("priority", "MEDIUM");

    const result = await createTicket(null, formData);

    expect(result).toEqual({ error: "Title is required" });
    expect(sendEmail).not.toHaveBeenCalled();

    const ticketCount = await prisma.ticket.count({
      where: { createdById: clientId },
    });
    expect(ticketCount).toBe(0);
  });
});
