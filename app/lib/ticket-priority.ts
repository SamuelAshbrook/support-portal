import type { TicketPriority } from "@/app/generated/prisma/client";

const priorityConfig: Record<
    TicketPriority,
    { label: string, className: string }
> = {
    LOW: {
        label: "Low",
        className: "bg-zinc-100 text-zinc-800 border-zinc-200"
    },
    MEDIUM: {
        label: "Medium",
        className: "bg-blue-100 text-blue-800 border-blue-200"
    },
    HIGH: {
        label: "High",
        className: "bg-amber-100 text-amber-800 border-amber-200"
    },
    URGENT: {
        label: "Urgent",
        className: "bg-red-100 text-red-800 border-red-200"
    },
};

export function getTicketPriorityDisplay(priority: TicketPriority) {
    return priorityConfig[priority];
}