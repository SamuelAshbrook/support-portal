"use server";
import { revalidatePath } from "next/cache";
import prisma from "@/app/lib/prisma";
import { assertAdmin } from "@/app/lib/session";
import { TicketStatus } from "@/app/generated/prisma/client";
import { getSession } from "@/app/lib/session";
import { notifyAdminsNewTicket, notifyNewMessage, notifyTicketStatusChanged } from "@/app/lib/email/ticket-notifications";
import { validateCreateTicketFields, validateTicketMessageContent } from "./ticket-fields";

export type CreateTicketState = {
    error?: string;
    success?: boolean;
};

export async function createTicket(
    _prevState: CreateTicketState | null,
    formData: FormData,
): Promise<CreateTicketState> {
    const session = await getSession();
    if (!session)
        return { error: "You must be logged in to create a ticket" };

    const user = session.user;

    if (user.role !== "CLIENT")
        return { error: "You must be a client to create a ticket" };

    if (!user.companyId)
        return { error: "You must be linked to a company to create a ticket" };

    const parsed = validateCreateTicketFields({
        title: String(formData.get("title") ?? ""),
        description: String(formData.get("description") ?? ""),
        type: String(formData.get("type")),
        priority: String(formData.get("priority")),
    });
    if ("error" in parsed) return { error: parsed.error };

    const { title, description, type, priority } = parsed.data;
    
    let ticket;
    try {
        ticket = await prisma.ticket.create({
            data: {
                title,
                description,
                type,
                priority,
                companyId: user.companyId,
                createdById: user.id,
            },
            include: {
                company: { select: { name: true } },
                createdBy: { select: { name: true, email: true } },
            },
        });
    } catch {
        return { error: "Something went wrong. Please try again." };
    }

    try {
        await notifyAdminsNewTicket({
            id: ticket.id,
            ticketNumber: ticket.ticketNumber,
            title: ticket.title,
            description: ticket.description,
            type: ticket.type,
            priority: ticket.priority,
            companyName: ticket.company.name,
            createdByName: ticket.createdBy.name,
            createdByEmail: ticket.createdBy.email,
        });
    } catch {
        console.error("[email] Failed to send new-ticket notification");
    }

    revalidatePath("/tickets");
    return { success: true };
}

export type AddMessageState = {
    error?: string;
    success?: boolean;
};

export async function addMessage(
    _prevState: AddMessageState | null,
    formData: FormData,
): Promise<AddMessageState> {
    const session = await getSession();
    if (!session)
        return { error: "You must be logged in to send a message" };

    const user = session.user;

    const ticketId = String(formData.get("ticketId") ?? "").trim();
    if (!ticketId)
        return { error: "Ticket not found" };

    const parsed = validateTicketMessageContent(
        String(formData.get("content") ?? ""),
    );
    if ("error" in parsed) return { error: parsed.error };
    const content = parsed.data;

    const ticket = await prisma.ticket.findUnique({
        where: { id: ticketId },
        select: {
            id: true,
            companyId: true,
            ticketNumber: true,
            title: true,
            company: { select: { name: true } },
            createdBy: { select: { email: true } },
        },
    });

    if (!ticket)
        return { error: "Ticket not found" };

    if (user.role !== "ADMIN" && ticket.companyId !== user.companyId)
        return { error: "You do not have access to this ticket" };

    try {
        await prisma.$transaction([
            prisma.ticketMessage.create({
                data: {
                    content,
                    ticketId: ticket.id,
                    senderId: user.id,
                },
            }),
            prisma.ticket.update({
                where: { id: ticket.id },
                data: { updatedAt: new Date() },
            }),
        ]);
    } catch {
        return { error: "Something went wrong. Please try again." };
    }

    if (user.role === "ADMIN" || user.role === "CLIENT") {
        try {
            await notifyNewMessage({
                ticketId: ticket.id,
                ticketNumber: ticket.ticketNumber,
                ticketTitle: ticket.title,
                companyName: ticket.company.name,
                createdByEmail: ticket.createdBy.email,
                senderRole: user.role,
                senderName: user.name ?? null,
                senderEmail: user.email,
                content,
            });
        } catch {
            console.error("[email] Failed to send new-message notification");
        }
    }

    revalidatePath(`/tickets/${ticket.id}`);
    return { success: true };
}

export async function updateTicketStatus(formData: FormData) {
    await assertAdmin();
    const id = String(formData.get("id"));
    const status = String(formData.get("status"));
    if (!Object.values(TicketStatus).includes(status as TicketStatus)) {
        throw new Error("Invalid status");
    }

    const ticket = await prisma.ticket.findUnique({
        where: { id },
        select: {
            id: true,
            status: true,
            ticketNumber: true,
            title: true,
            company: { select: { name: true } },
            createdBy: { select: { email: true } },
        },
    });

    if (!ticket) {
        throw new Error("Ticket not found");
    }

    const nextStatus = status as TicketStatus;
    if (ticket.status === nextStatus) {
        revalidatePath(`/tickets/${id}`);
        return;
    }

    await prisma.ticket.update({
        where: { id },
        data: { status: nextStatus },
    });

    try {
        await notifyTicketStatusChanged({
            ticketId: ticket.id,
            ticketNumber: ticket.ticketNumber,
            ticketTitle: ticket.title,
            companyName: ticket.company.name,
            createdByEmail: ticket.createdBy.email,
            previousStatus: ticket.status,
            newStatus: nextStatus,
        });
    } catch {
        console.error("[email] Failed to send status-change notification");
    }

    revalidatePath(`/tickets/${id}`);
}