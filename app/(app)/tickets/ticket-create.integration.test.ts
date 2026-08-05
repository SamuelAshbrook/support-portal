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
import { createTicket } from "./actions";

const suffix = `create-${Date.now()}`;
const ticketTitle = `Created ticket ${suffix}`;

describe("ticket create (integration)", () => {
  let companyAId: string;
  let companyBId: string;
  let clientAId: string;
  let createdTicketId: string | undefined;

  beforeAll(async () => {
    const companyA = await prisma.company.create({
      data: { name: `Create Co A ${suffix}`, billingRate: 50 },
    });
    const companyB = await prisma.company.create({
      data: { name: `Create Co B ${suffix}`, billingRate: 50 },
    });
    companyAId = companyA.id;
    companyBId = companyB.id;

    const clientA = await prisma.user.create({
      data: {
        email: `create-client-a-${suffix}@example.com`,
        name: "Create Client A",
        role: "CLIENT",
        companyId: companyA.id,
      },
    });
    clientAId = clientA.id;
  });

  afterAll(async () => {
    if (createdTicketId) {
      await prisma.ticketMessage.deleteMany({
        where: { ticketId: createdTicketId },
      });
      await prisma.ticket.deleteMany({ where: { id: createdTicketId } });
    }
    // Also clean by title in case create succeeded but we failed to capture id
    await prisma.ticket.deleteMany({ where: { title: ticketTitle } });

    if (clientAId) {
      await prisma.user.deleteMany({ where: { id: clientAId } });
    }
    if (companyAId || companyBId) {
      await prisma.company.deleteMany({
        where: { id: { in: [companyAId, companyBId].filter(Boolean) } },
      });
    }
  });

  it("assigns the ticket company from the creating user's company", async () => {
    vi.mocked(getSession).mockResolvedValue({
      user: {
        id: clientAId,
        role: "CLIENT",
        companyId: companyAId,
        email: `create-client-a-${suffix}@example.com`,
        name: "Create Client A",
      },
    } as Awaited<ReturnType<typeof getSession>>);

    const formData = new FormData();
    formData.set("title", ticketTitle);
    formData.set("description", "Integration create ticket description");
    formData.set("type", "FIX_PROBLEM");
    formData.set("priority", "MEDIUM");
    // Forged company must be ignored — company comes from the session user
    formData.set("companyId", companyBId);

    const result = await createTicket(null, formData);

    expect(result).toEqual({ success: true });

    const ticket = await prisma.ticket.findFirst({
      where: { title: ticketTitle, createdById: clientAId },
      select: { id: true, companyId: true, createdById: true },
    });

    expect(ticket).not.toBeNull();
    createdTicketId = ticket!.id;
    expect(ticket!.companyId).toBe(companyAId);
    expect(ticket!.companyId).not.toBe(companyBId);
    expect(ticket!.createdById).toBe(clientAId);
  });
});
