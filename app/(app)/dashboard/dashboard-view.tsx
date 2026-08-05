import {
  AlertCircle,
  Calendar,
  Clock,
  Pause,
  Ticket,
} from "lucide-react";
import type { DashboardStats } from "@/app/lib/dashboard-stats";
import { MetricCard } from "./metric-card";
import { TrendsChart } from "./trends-chart";

type DashboardViewProps = {
  stats: DashboardStats;
  subtitle?: string;
};

export function DashboardView({
  stats,
  subtitle = "Overview of your support desk",
}: DashboardViewProps) {
  return (
    <div className="min-h-full bg-white p-6 md:p-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>
      </header>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <MetricCard
          title="Unresolved"
          value={stats.unresolved}
          subtitle="Open and pending"
          icon={AlertCircle}
        />
        <MetricCard
          title="Overdue"
          value={stats.overdue}
          subtitle="Past due date"
          icon={Clock}
        />
        <MetricCard
          title="Due today"
          value={stats.dueToday}
          subtitle="Need attention"
          icon={Calendar}
        />
        <MetricCard
          title="Open"
          value={stats.open}
          subtitle="Awaiting response"
          icon={Ticket}
        />
        <MetricCard
          title="On hold"
          value={stats.onHold}
          subtitle="Temporarily paused"
          icon={Pause}
        />
      </section>

      <section className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-4 lg:items-stretch">
        <div className="flex flex-col rounded-lg border border-[#e8eaed] bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)] lg:col-span-3">
          <div className="mb-2">
            <h2 className="text-base font-semibold text-zinc-900">
              Tickets Opened
            </h2>
            <p className="text-sm text-zinc-400">{stats.monthLabel}</p>
          </div>
          <div className="mt-2 flex-1">
            <TrendsChart
              values={stats.trendByDay}
              daysInMonth={stats.daysInMonth}
            />
          </div>
        </div>

        <div className="grid h-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <MetricCard
            title="Resolved"
            value={stats.resolvedThisMonth}
            subtitle="This month"
          />
          <MetricCard
            title="Received"
            value={stats.receivedThisMonth}
            subtitle="This month"
          />
          <MetricCard
            title="Avg first response"
            value={stats.avgFirstResponseLabel}
            subtitle="Response time"
          />
          <MetricCard
            title="Avg response"
            value={stats.avgResponseLabel}
            subtitle="Between comments"
          />
        </div>
      </section>
    </div>
  );
}
