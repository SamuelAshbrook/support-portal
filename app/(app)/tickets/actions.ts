"use server";
import { revalidatePath } from "next/cache";
import prisma from "@/app/lib/prisma";
import { assertAdmin } from "@/app/lib/session";
import { TicketStatus, TicketType, TicketPriority } from "@/app/generated/prisma/client";
import { getSession } from "@/app/lib/session";

const MAX_TITLE = 200;
const MAX_DESCRIPTION = 5000;
const MAX_MESSAGE = 5000;

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

    const title = String(formData.get("title") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();

    if (!title) return { error: "Title is required" };
    if (!description) return { error: "Description is required" };
    if (title.length > MAX_TITLE) 
        return { error: `Title must be ${MAX_TITLE} characters or less` };
    if (description.length > MAX_DESCRIPTION)
        return { error: `Description must be ${MAX_DESCRIPTION} characters or less` };

    const type = String(formData.get("type"));
    const priority = String(formData.get("priority"));

    if(!Object.values(TicketType).includes(type as TicketType))
        return { error: "Invalid ticket type" };

    if(!Object.values(TicketPriority).includes(priority as TicketPriority))
        return { error: "Invalid ticket priority" };
    
    try {
        await prisma.ticket.create({
            data: {
                title,
                description,
                type: type as TicketType,
                priority: priority as TicketPriority,
                companyId: user.companyId,
                createdById: user.id,
            },
        });
    } catch {
        return { error: "Something went wrong. Please try again." };
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

    const content = String(formData.get("content") ?? "").trim();
    if (!content)
        return { error: "Message cannot be empty" };
    if (content.length > MAX_MESSAGE)
        return { error: `Message must be ${MAX_MESSAGE} characters or less` };

    const ticket = await prisma.ticket.findUnique({
        where: { id: ticketId },
        select: { id: true, companyId: true },
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

    revalidatePath(`/tickets/${ticket.id}`);
    return { success: true };
}

export async function updateTicketStatus(formData: FormData) {
    await assertAdmin();
    const id = String(formData.get("id"));
    const status = String(formData.get("status"));
    if(!Object.values(TicketStatus).includes(status as TicketStatus)) {
        throw new Error("Invalid status");
    }
    await prisma.ticket.update({ where: { id }, data: { status: status as TicketStatus } });
    revalidatePath(`/tickets/${id}`);
}