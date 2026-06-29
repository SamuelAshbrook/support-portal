import Link from "next/link";
import prisma from "@/app/lib/prisma";
import { requireUser } from "@/app/lib/session";
import { createTicket } from "./actions";

export default async function TicketsPage() {
    const user = await requireUser();
    const isAdmin = user.role === "ADMIN";

    const tickets = await prisma.ticket.findMany({
        where: isAdmin ? {} : { companyId: user.companyId ?? "__none__" },
        orderBy: { updatedAt: "desc" },
        include: {
            company: true,
            createdBy: { select: { name: true, email: true } },
            _count: { select: { messages: true } },
        },
    });

    return (
        <div className="space-y-4 p-6">
            <h1 className="text-2xl font-bold">Tickets</h1>

            { ! isAdmin && (
                <form action={createTicket} className="grid max-w-md gap-2">
                    <input 
                        name="title" 
                        placeholder="Title"
                        className="w-full rounded-md border border-zinc-300 p-2"
                    />
                    <textarea
                        name="description"
                        placeholder="Describe the issue"
                        className="w-full rounded-md border border-zinc-300 p-2"
                    />
                    <button className="w-full rounded-md bg-blue-500 text-white p-2">Create Ticket</button>
                </form>
            )}

            <ul className="divide-y divide-zinc-200">
                {tickets.map((ticket) => (
                <li key={ticket.id} className="p-4">
                    <Link
                    href={`/tickets/${ticket.id}`}
                    className="font-medium hover:underline"
                    >
                    {ticket.title}
                    </Link>
                    <div className="text-sm text-zinc-500">
                    {ticket.status}
                    {isAdmin && ` · ${ticket.company.name}`}
                    {` · ${ticket._count.messages} messages`}
                    </div>
                </li>
                ))}
            </ul>
        </div>
    );
}