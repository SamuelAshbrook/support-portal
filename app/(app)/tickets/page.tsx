import Link from "next/link";
import prisma from "@/app/lib/prisma";
import { requireUser } from "@/app/lib/session";
import { formatCreatedAgo, formatTicketDate } from "@/app/lib/format-date";
import { User, Building2, Clock, Calendar } from 'lucide-react';
import { formatExcerpt } from "@/app/lib/format-excerpt";
import { getTicketStatusDisplay } from "@/app/lib/ticket-status";
import { getTicketPriorityDisplay } from "@/app/lib/ticket-priority";
import { CreateTicketForm } from "./create-ticket-form";

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

            {!isAdmin && <CreateTicketForm />}

            <ul className="flex flex-col gap-4 divide-y divide-zinc-200">
                {tickets.map((ticket) => {
                    const statusDisplay = getTicketStatusDisplay(ticket.status);
                    const priorityDisplay = getTicketPriorityDisplay(ticket.priority);
                    return (
                        <li key={ticket.id} className="rounded-lg bg-white shadow-sm transition-colors border border-[#e3e5e8]">
                            <Link
                                href={`/tickets/${ticket.id}`}
                                className="w-full h-full cursor-pointer block p-4"
                            >
                                <div className="flex justify-between">
                                    <div className="flex items-center gap-2 text-sm">
                                        #{ticket.ticketNumber}
                                        <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-medium ${priorityDisplay.className}`}>
                                            {priorityDisplay.label}
                                        </div>
                                    </div>
                                    <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-sm font-medium ${statusDisplay.className}`}>
                                        {statusDisplay.label}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1 text-sm text-zinc-500 mt-1">
                                    <h3 className="text-base font-medium text-zinc-900">{ticket.title}</h3>
                                    {formatExcerpt(ticket.description)}
                                </div>
                                <div className="flex gap-2 text-sm text-zinc-500 mt-3">
                                    <div className="flex items-center gap-1">
                                        <User className="size-4" />
                                        {ticket.createdBy.name ?? ticket.createdBy.email}
                                    </div>
                                    <span className="mx-2">•</span>
                                    <div className="flex items-center gap-1">
                                        <Building2 className="size-4" />
                                        {ticket.company.name}
                                    </div>
                                    <span className="mx-2">•</span>
                                    <div className="flex items-center gap-1">
                                        <Clock className="size-4" />
                                        {formatCreatedAgo(ticket.createdAt)}
                                    </div>
                                    <span className="mx-2">•</span>
                                    <div className="flex items-center gap-1">
                                        <Calendar className="size-4" />
                                        {formatTicketDate(ticket.createdAt)}
                                    </div>
                                </div>
                            </Link>
                        </li>
                    )}
                )}
            </ul>
        </div>
    );
}