import type { TicketType } from "@/app/generated/prisma/client";

const typeConfig: Record<
    TicketType,
    { label: string, className: string }
> = {
    FIX_PROBLEM: {
        label: "Fix a problem",
        className: "bg-red-100 text-red-800 border-red-200"
    },
    ASK_QUESTION: {
        label: "Ask a question",
        className: "bg-sky-100 text-sky-800 border-sky-200"
    },
    UPDATE_OR_ADD: {
        label: "Update or add something",
        className: "bg-violet-100 text-violet-800 border-violet-200"
    },
    BILLING: {
        label: "Billing",
        className: "bg-emerald-100 text-emerald-800 border-emerald-200"
    },
};

export function getTicketTypeDisplay(type: TicketType) {
    return typeConfig[type];
}