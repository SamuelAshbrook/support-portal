"use server";
import { revalidatePath } from "next/cache";
import prisma from "@/app/lib/prisma";
import { assertAdmin } from "@/app/lib/session";
import { TicketStatus } from "@/app/generated/prisma/client";
import { getSession } from "@/app/lib/session";

const MAX_TITLE = 200;
const MAX_DESCRIPTION = 5000;

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
    
    try {
        await prisma.ticket.create({
            data: {
                title,
                description,
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