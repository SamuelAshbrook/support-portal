import Link from "next/link";
import { Ticket } from "lucide-react";
import type { ClientDashboardStats } from "@/app/lib/dashboard-stats";

type ClientDashboardProps = {
  stats: ClientDashboardStats;
};

const statusCards: {
  key: keyof ClientDashboardStats;
  label: string;
  description: string;
}[] = [
  {
    key: "open",
    label: "Open",
    description: "Awaiting support response",
  },
  {
    key: "pending",
    label: "Pending",
    description: "Action needed from you",
  },
  {
    key: "onHold",
    label: "On Hold",
    description: "Temporarily paused",
  },
  {
    key: "resolved",
    label: "Resolved",
    description: "Please confirm",
  },
];

export function ClientDashboard({ stats }: ClientDashboardProps) {
  return (
    <div className="min-h-full bg-[#f7f7f8] p-6 md:p-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Welcome back! Here&apos;s an overview of your support tickets.
        </p>
      </header>

      <section className="rounded-lg border border-[#e8eaed] bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <div className="mb-4 flex items-center gap-2">
          <Ticket
            className="size-4 text-zinc-700"
            strokeWidth={1.75}
            aria-hidden
          />
          <h2 className="text-base font-semibold text-zinc-900">
            Your Tickets
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {statusCards.map((card) => (
            <div
              key={card.key}
              className="rounded-lg border border-[#e8eaed] bg-white px-4 py-5"
            >
              <p className="text-3xl font-semibold tracking-tight text-zinc-900">
                {stats[card.key]}
              </p>
              <p className="mt-1 text-sm font-medium text-zinc-800">
                {card.label}
              </p>
              <p className="mt-0.5 text-sm text-zinc-400">{card.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-4 flex flex-col items-start justify-between gap-4 rounded-lg border border-[#f3c9d4] bg-[#fdf4f6] px-5 py-5 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-base font-semibold text-zinc-900">Need Help?</h2>
          <p className="mt-0.5 text-sm text-zinc-500">
            Create a new support ticket and our team will assist you
          </p>
        </div>
        <Link
          href="/tickets"
          className="inline-flex shrink-0 items-center justify-center rounded-md bg-[#E9426F] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#d63663]"
        >
          + Create New Ticket
        </Link>
      </section>
    </div>
  );
}
