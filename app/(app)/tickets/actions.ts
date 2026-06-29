"use server";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import prisma from "@/app/lib/prisma";
import { auth } from "@/app/lib/auth";
import { assertAdmin } from "@/app/lib/session";
import { TicketStatus } from "@/app/generated/prisma/client";

export async function createTicket(formData: FormData) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session)
        throw new Error("Unauthorized");

    const title = String(formData.get("title") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    if (!title || !description)
        throw new Error("Title and description are required");

    const companyId = session.user.companyId;
    if (!companyId)
        throw new Error("Account is not linked to a company");

    await prisma.ticket.create({
        data: {
            title,
            description,
            companyId,
            createdById: session.user.id,
        },
    });
    revalidatePath("/tickets");
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