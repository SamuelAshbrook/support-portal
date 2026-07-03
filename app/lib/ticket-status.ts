import type { TicketStatus } from "@/app/generated/prisma/client";

const statusConfig: Record<
    TicketStatus,
    { label: string, className: string }
> = {
    OPEN: { 
        label: "Open", 
        className: "bg-blue-100 text-blue-800 border-blue-200" 
    },
    IN_PROGRESS: {
        label: "In Progress",
        className: "bg-amber-100 text-amber-800 border-amber-200"
    },
    RESOLVED: {
        label: "Resolved",
        className: "bg-emerald-100 text-emerald-800 border-emerald-200"
    },
    ARCHIVED: {
        label: "Archived",
        className: "bg-zinc-100 text-zinc-800 border-zinc-200"
    },
};

export function getTicketStatusDisplay(status: TicketStatus) {
    return statusConfig[status];
}