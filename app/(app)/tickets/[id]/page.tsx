import { notFound } from "next/navigation";
import prisma from "@/app/lib/prisma";
import { requireUser } from "@/app/lib/session";
import { formatTicketDate } from "@/app/lib/format-date";
import { updateTicketStatus } from "../actions";
import { ReplyForm } from "./reply-form";

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
            <section className="space-y-4">
                <h2 className="font-semibold">Messages</h2>

                {ticket.messages.length === 0 ? (
                    <p className="rounded-md border border-dashed border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-500">
                        No messages yet — start the conversation.
                    </p>
                ) : (
                    <ul className="space-y-3">
                        {ticket.messages.map((m) => {
                            const isMine = m.senderId === user.id;
                            const isAdmin = m.sender.role === "ADMIN";
                            return (
                                <li
                                    key={m.id}
                                    className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                                >
                                    <div
                                        className={`max-w-[80%] rounded-lg border p-3 ${
                                            isMine
                                                ? "border-[#f5c6bd] bg-[#fdeeec]"
                                                : "border-zinc-200 bg-white"
                                        }`}
                                    >
                                        <div className="mb-1 flex items-center gap-2 text-xs text-zinc-500">
                                            <span className="font-medium text-zinc-700">
                                                {m.sender.name ?? m.sender.email}
                                            </span>
                                            <span
                                                className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                                                    isAdmin
                                                        ? "bg-[#2d3252] text-white"
                                                        : "bg-zinc-100 text-zinc-600"
                                                }`}
                                            >
                                                {isAdmin ? "Admin" : "Client"}
                                            </span>
                                            <span>·</span>
                                            <span>{formatTicketDate(m.createdAt)}</span>
                                        </div>
                                        <p className="whitespace-pre-wrap text-sm text-zinc-800">
                                            {m.content}
                                        </p>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}

                <ReplyForm ticketId={ticket.id} />
            </section>
      </div>
    );
   
}