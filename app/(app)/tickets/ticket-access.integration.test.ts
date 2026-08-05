import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("@/app/lib/session", () => ({
  getSession: vi.fn(),
  requireUser: vi.fn(),
  requireAdmin: vi.fn(),
  assertAdmin: vi.fn(),
}));

vi.mock("@/app/lib/email/ticket-notifications", () => ({
  notifyAdminsNewTicket: vi.fn(),
  notifyNewMessage: vi.fn(),
  notifyTicketStatusChanged: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import prisma from "@/app/lib/prisma";
import { getSession } from "@/app/lib/session";
import { addMessage } from "./actions";

const suffix = `integ-${Date.now()}`;

describe("ticket access (integration)", () => {
  let companyAId: string;
  let companyBId: string;
  let clientAId: string;
  let userBId: string;
  let ticketBId: string;

  beforeAll(async () => {
    const companyA = await prisma.company.create({
      data: { name: `Company A ${suffix}`, billingRate: 50 },
    });
    const companyB = await prisma.company.create({
      data: { name: `Company B ${suffix}`, billingRate: 50 },
    });
    companyAId = companyA.id;
    companyBId = companyB.id;

    const clientA = await prisma.user.create({
      data: {
        email: `client-a-${suffix}@example.com`,
        name: "Client A",
        role: "CLIENT",
        companyId: companyA.id,
      },
    });
    const userB = await prisma.user.create({
      data: {
        email: `user-b-${suffix}@example.com`,
        name: "User B",
        role: "CLIENT",
        companyId: companyB.id,
      },
    });
    clientAId = clientA.id;
    userBId = userB.id;

    const ticketB = await prisma.ticket.create({
      data: {
        title: `Cross-company ticket ${suffix}`,
        description: "Belongs to company B",
        type: "FIX_PROBLEM",
        priority: "MEDIUM",
        companyId: companyB.id,
        createdById: userB.id,
      },
    });
    ticketBId = ticketB.id;
  });

  afterAll(async () => {
    await prisma.ticketMessage.deleteMany({ where: { ticketId: ticketBId } });
    if (ticketBId) {
      await prisma.ticket.deleteMany({ where: { id: ticketBId } });
    }
    if (clientAId || userBId) {
      await prisma.user.deleteMany({
        where: { id: { in: [clientAId, userBId].filter(Boolean) } },
      });
    }
    if (companyAId || companyBId) {
      await prisma.company.deleteMany({
        where: { id: { in: [companyAId, companyBId].filter(Boolean) } },
      });
    }
  });

  it("denies client access to a ticket belonging to another company", async () => {
    vi.mocked(getSession).mockResolvedValue({
      user: {
        id: clientAId,
        role: "CLIENT",
        companyId: companyAId,
        email: `client-a-${suffix}@example.com`,
        name: "Client A",
      },
    } as Awaited<ReturnType<typeof getSession>>);

    const formData = new FormData();
    formData.set("ticketId", ticketBId);
    formData.set("content", "Should not be allowed");

    const result = await addMessage(null, formData);

    expect(result).toEqual({
      error: "You do not have access to this ticket",
    });

    const messageCount = await prisma.ticketMessage.count({
      where: { ticketId: ticketBId },
    });
    expect(messageCount).toBe(0);
  });
});
