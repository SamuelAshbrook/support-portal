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
const suffix = `notify-${Date.now()}`;
const ticketTitle = `Notify inbox ticket ${suffix}`;

describe("new ticket support inbox notification (integration)", () => {
  let companyId: string;
  let clientId: string;
  let createdTicketId: string | undefined;
  let previousInbox: string | undefined;

  beforeAll(async () => {
    previousInbox = process.env.SUPPORT_INBOX_EMAIL;
    process.env.SUPPORT_INBOX_EMAIL = SUPPORT_INBOX;

    const company = await prisma.company.create({
      data: { name: `Notify Co ${suffix}`, billingRate: 50 },
    });
    companyId = company.id;

    const client = await prisma.user.create({
      data: {
        email: `notify-client-${suffix}@example.com`,
        name: "Notify Client",
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

    if (createdTicketId) {
      await prisma.ticketMessage.deleteMany({
        where: { ticketId: createdTicketId },
      });
      await prisma.ticket.deleteMany({ where: { id: createdTicketId } });
    }
    await prisma.ticket.deleteMany({ where: { title: ticketTitle } });

    if (clientId) {
      await prisma.user.deleteMany({ where: { id: clientId } });
    }
    if (companyId) {
      await prisma.company.deleteMany({ where: { id: companyId } });
    }
  });

  it("notifies the shared support inbox when a client creates a ticket", async () => {
    vi.mocked(sendEmail).mockClear();

    vi.mocked(getSession).mockResolvedValue({
      user: {
        id: clientId,
        role: "CLIENT",
        companyId,
        email: `notify-client-${suffix}@example.com`,
        name: "Notify Client",
      },
    } as Awaited<ReturnType<typeof getSession>>);

    const formData = new FormData();
    formData.set("title", ticketTitle);
    formData.set("description", "Please check the shared inbox notification");
    formData.set("type", "ASK_QUESTION");
    formData.set("priority", "HIGH");

    const result = await createTicket(null, formData);
    expect(result).toEqual({ success: true });

    const ticket = await prisma.ticket.findFirst({
      where: { title: ticketTitle, createdById: clientId },
      select: { id: true, ticketNumber: true },
    });
    expect(ticket).not.toBeNull();
    createdTicketId = ticket!.id;

    expect(sendEmail).toHaveBeenCalledTimes(1);
    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: SUPPORT_INBOX,
        subject: `[Ticket #${ticket!.ticketNumber}] New ticket: ${ticketTitle}`,
      }),
    );
  });
});
