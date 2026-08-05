import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("@/app/lib/session", () => ({
  getSession: vi.fn(),
  requireUser: vi.fn(),
  requireAdmin: vi.fn(),
  assertAdmin: vi.fn().mockResolvedValue({
    id: "admin-user",
    role: "ADMIN",
  }),
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
import { updateTicketStatus } from "./actions";

const suffix = `status-notify-${Date.now()}`;
const authorEmail = `status-author-${suffix}@example.com`;
const ticketTitle = `Status notify ticket ${suffix}`;

describe("ticket status change notification (integration)", () => {
  let companyId: string;
  let authorId: string;
  let ticketId: string;
  let ticketNumber: number;

  beforeAll(async () => {
    const company = await prisma.company.create({
      data: { name: `Status Notify Co ${suffix}`, billingRate: 50 },
    });
    companyId = company.id;

    const author = await prisma.user.create({
      data: {
        email: authorEmail,
        name: "Status Author",
        role: "CLIENT",
        companyId: company.id,
      },
    });
    authorId = author.id;

    const ticket = await prisma.ticket.create({
      data: {
        title: ticketTitle,
        description: "Status change should email the author",
        type: "FIX_PROBLEM",
        priority: "MEDIUM",
        status: "OPEN",
        companyId: company.id,
        createdById: author.id,
      },
    });
    ticketId = ticket.id;
    ticketNumber = ticket.ticketNumber;
  });

  afterAll(async () => {
    if (ticketId) {
      await prisma.ticketMessage.deleteMany({ where: { ticketId } });
      await prisma.ticket.deleteMany({ where: { id: ticketId } });
    }
    if (authorId) {
      await prisma.user.deleteMany({ where: { id: authorId } });
    }
    if (companyId) {
      await prisma.company.deleteMany({ where: { id: companyId } });
    }
  });

  it("emails the ticket author when an admin changes the ticket status", async () => {
    vi.mocked(sendEmail).mockClear();

    const formData = new FormData();
    formData.set("id", ticketId);
    formData.set("status", "IN_PROGRESS");

    await updateTicketStatus(formData);

    const updated = await prisma.ticket.findUnique({
      where: { id: ticketId },
      select: { status: true },
    });
    expect(updated?.status).toBe("IN_PROGRESS");

    expect(sendEmail).toHaveBeenCalledTimes(1);
    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: authorEmail,
        subject: `[Ticket #${ticketNumber}] Status updated: ${ticketTitle}`,
      }),
    );
  });
});
