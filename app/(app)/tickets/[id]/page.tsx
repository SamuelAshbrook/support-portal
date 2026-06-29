import { notFound } from "next/navigation";
import prisma from "@/app/lib/prisma";
import { requireUser } from "@/app/lib/session";
import { updateTicketStatus } from "../actions";

export default async function TicketPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const user = await requireUser();

    const ticket = await prisma.ticket.findUnique({
        where: { id },
        include: {
            company: true,
            createdBy: true,
            messages: { include: { sender: true }, orderBy: { createdAt: "asc" } },
        },
    });
    
    if (!ticket)
        notFound();
    
    if (user.role !== "ADMIN" && ticket.companyId !== user.companyId) {
        notFound();
    }

    return (
        <div className="space-y-4 p-6">
            <h1 className="text-2xl font-bold">{ticket.title}</h1>
            <div className="text-sm text-zinc-500">
                {ticket.status} · {ticket.company.name} · opened by{" "}
                {ticket.createdBy.name ?? ticket.createdBy.email}
            </div>
            {user.role === "ADMIN" && (
                <form action={updateTicketStatus} className="grid max-w-md gap-2">
                    <input type="hidden" name="id" value={ticket.id} />
                    <select name="status" defaultValue={ticket.status} className="w-full rounded-md border border-zinc-300 p-2">
                        <option value="OPEN">Open</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="RESOLVED">Resolved</option>
                        <option value="ARCHIVED">Archived</option>
                    </select>
                    <button className="w-full rounded-md bg-blue-500 text-white p-2">Update Status</button>
                </form>
            )}
            <p className="whitespace-pre-wrap">{ticket.description}</p>
            <section className="space-y-2">
                <h2 className="font-semibold">Messages</h2>
                {ticket.messages.length === 0 && (
                    <p className="text-sm text-zinc-500">No messages yet.</p>
                )}
                {ticket.messages.map((m) => (
                    <div key={m.id} className="rounded-md border border-zinc-200 p-3">
                        <div className="text-xs text-zinc-500">
                            {m.sender.name ?? m.sender.email}
                        </div>
                        <p className="whitespace-pre-wrap">{m.content}</p>
                    </div>
                ))}
            </section>
      </div>
    );
   
}