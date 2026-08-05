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
import { addMessage } from "./actions";

const SUPPORT_INBOX = "support-inbox@step3digital.test";
const suffix = `msg-notify-${Date.now()}`;
const authorEmail = `msg-author-${suffix}@example.com`;
const ticketTitle = `Message notify ticket ${suffix}`;

describe("ticket message notifications (integration)", () => {
  let companyId: string;
  let authorId: string;
  let adminId: string;
  let ticketId: string;
  let ticketNumber: number;
  let previousInbox: string | undefined;

  beforeAll(async () => {
    previousInbox = process.env.SUPPORT_INBOX_EMAIL;
    process.env.SUPPORT_INBOX_EMAIL = SUPPORT_INBOX;

    const company = await prisma.company.create({
      data: { name: `Msg Notify Co ${suffix}`, billingRate: 50 },
    });
    companyId = company.id;

    const author = await prisma.user.create({
      data: {
        email: authorEmail,
        name: "Message Author",
        role: "CLIENT",
        companyId: company.id,
      },
    });
    authorId = author.id;

    const admin = await prisma.user.create({
      data: {
        email: `msg-admin-${suffix}@example.com`,
        name: "Message Admin",
        role: "ADMIN",
      },
    });
    adminId = admin.id;

    const ticket = await prisma.ticket.create({
      data: {
        title: ticketTitle,
        description: "Message notification integration ticket",
        type: "ASK_QUESTION",
        priority: "MEDIUM",
        companyId: company.id,
        createdById: author.id,
      },
    });
    ticketId = ticket.id;
    ticketNumber = ticket.ticketNumber;
  });

  afterAll(async () => {
    if (previousInbox === undefined) {
      delete process.env.SUPPORT_INBOX_EMAIL;
    } else {
      process.env.SUPPORT_INBOX_EMAIL = previousInbox;
    }

    if (ticketId) {
      await prisma.ticketMessage.deleteMany({ where: { ticketId } });
      await prisma.ticket.deleteMany({ where: { id: ticketId } });
    }
    if (authorId || adminId) {
      await prisma.user.deleteMany({
        where: { id: { in: [authorId, adminId].filter(Boolean) } },
      });
    }
    if (companyId) {
      await prisma.company.deleteMany({ where: { id: companyId } });
    }
  });

  it("emails the shared support inbox when a client adds a message", async () => {
    vi.mocked(sendEmail).mockClear();

    vi.mocked(getSession).mockResolvedValue({
      user: {
        id: authorId,
        role: "CLIENT",
        companyId,
        email: authorEmail,
        name: "Message Author",
      },
    } as Awaited<ReturnType<typeof getSession>>);

    const formData = new FormData();
    formData.set("ticketId", ticketId);
    formData.set("content", "Client reply should notify support inbox");

    const result = await addMessage(null, formData);
    expect(result).toEqual({ success: true });

    const messageCount = await prisma.ticketMessage.count({
      where: { ticketId, senderId: authorId },
    });
    expect(messageCount).toBeGreaterThanOrEqual(1);

    expect(sendEmail).toHaveBeenCalledTimes(1);
    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: SUPPORT_INBOX,
        subject: `[Ticket #${ticketNumber}] New reply: ${ticketTitle}`,
      }),
    );
  });

  it("emails the ticket author when an admin adds a message", async () => {
    vi.mocked(sendEmail).mockClear();

    vi.mocked(getSession).mockResolvedValue({
      user: {
        id: adminId,
        role: "ADMIN",
        companyId: null,
        email: `msg-admin-${suffix}@example.com`,
        name: "Message Admin",
      },
    } as Awaited<ReturnType<typeof getSession>>);

    const formData = new FormData();
    formData.set("ticketId", ticketId);
    formData.set("content", "Admin reply should notify the ticket author");

    const result = await addMessage(null, formData);
    expect(result).toEqual({ success: true });

    const messageCount = await prisma.ticketMessage.count({
      where: { ticketId, senderId: adminId },
    });
    expect(messageCount).toBe(1);

    expect(sendEmail).toHaveBeenCalledTimes(1);
    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: authorEmail,
        subject: `[Ticket #${ticketNumber}] New reply: ${ticketTitle}`,
      }),
    );
  });
});
