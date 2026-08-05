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

const suffix = `status-invalid-${Date.now()}`;
const authorEmail = `status-invalid-author-${suffix}@example.com`;
const ticketTitle = `Invalid status ticket ${suffix}`;

describe("invalid ticket status change does not notify (integration)", () => {
  let companyId: string;
  let authorId: string;
  let ticketId: string;

  beforeAll(async () => {
    const company = await prisma.company.create({
      data: { name: `Invalid Status Co ${suffix}`, billingRate: 50 },
    });
    companyId = company.id;

    const author = await prisma.user.create({
      data: {
        email: authorEmail,
        name: "Invalid Status Author",
        role: "CLIENT",
        companyId: company.id,
      },
    });
    authorId = author.id;

    const ticket = await prisma.ticket.create({
      data: {
        title: ticketTitle,
        description: "Invalid status should not email",
        type: "FIX_PROBLEM",
        priority: "MEDIUM",
        status: "OPEN",
        companyId: company.id,
        createdById: author.id,
      },
    });
    ticketId = ticket.id;
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

  it("does not email the author when the admin submits an invalid status", async () => {
    vi.mocked(sendEmail).mockClear();

    const formData = new FormData();
    formData.set("id", ticketId);
    formData.set("status", "Closed"); // not a TicketStatus enum value

    await expect(updateTicketStatus(formData)).rejects.toThrow("Invalid status");

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      select: { status: true },
    });
    expect(ticket?.status).toBe("OPEN");
    expect(sendEmail).not.toHaveBeenCalled();
  });
});
