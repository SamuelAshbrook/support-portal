import prisma from "@/app/lib/prisma";
import type { Prisma } from "@/app/generated/prisma/client";

export type DashboardStats = {
  unresolved: number;
  overdue: number;
  dueToday: number;
  open: number;
  onHold: number;
  resolvedThisMonth: number;
  receivedThisMonth: number;
  avgFirstResponseLabel: string;
  avgResponseLabel: string;
  monthLabel: string;
  trendByDay: number[];
  daysInMonth: number;
};

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function startOfNextMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 1);
}

function daysInMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

function formatDuration(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) return "—";
  const minutes = Math.round(ms / 60_000);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.round(minutes / 60);
  if (hours < 48) return `${hours}h`;
  const days = Math.round(hours / 24);
  return `${days}d`;
}

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export async function getDashboardStats(
  companyId?: string | null,
): Promise<DashboardStats> {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = startOfNextMonth(now);
  const dayCount = daysInMonth(now);

  const scope: Prisma.TicketWhereInput =
    companyId === undefined
      ? {}
      : { companyId: companyId ?? "__none__" };

  const [
    open,
    inProgress,
    resolvedThisMonth,
    receivedThisMonth,
    createdThisMonth,
    ticketsForResponse,
  ] = await Promise.all([
    prisma.ticket.count({
      where: { ...scope, status: "OPEN" },
    }),
    prisma.ticket.count({
      where: { ...scope, status: "IN_PROGRESS" },
    }),
    prisma.ticket.count({
      where: {
        ...scope,
        status: "RESOLVED",
        updatedAt: { gte: monthStart, lt: monthEnd },
      },
    }),
    prisma.ticket.count({
      where: {
        ...scope,
        createdAt: { gte: monthStart, lt: monthEnd },
      },
    }),
    prisma.ticket.findMany({
      where: {
        ...scope,
        createdAt: { gte: monthStart, lt: monthEnd },
      },
      select: { createdAt: true },
    }),
    prisma.ticket.findMany({
      where: scope,
      select: {
        createdAt: true,
        createdById: true,
        messages: {
          orderBy: { createdAt: "asc" },
          select: {
            createdAt: true,
            senderId: true,
            sender: { select: { role: true } },
          },
        },
      },
    }),
  ]);

  const trendByDay = Array.from({ length: dayCount }, () => 0);
  for (const ticket of createdThisMonth) {
    const day = ticket.createdAt.getDate();
    trendByDay[day - 1] += 1;
  }

  const firstResponseMs: number[] = [];
  const responseGapMs: number[] = [];

  for (const ticket of ticketsForResponse) {
    const firstStaffReply = ticket.messages.find(
      (message) =>
        message.sender.role === "ADMIN" ||
        message.senderId !== ticket.createdById,
    );

    if (firstStaffReply) {
      firstResponseMs.push(
        firstStaffReply.createdAt.getTime() - ticket.createdAt.getTime(),
      );
    }

    for (let i = 1; i < ticket.messages.length; i++) {
      const prev = ticket.messages[i - 1];
      const curr = ticket.messages[i];
      responseGapMs.push(curr.createdAt.getTime() - prev.createdAt.getTime());
    }
  }

  const avgFirst = average(firstResponseMs);
  const avgResponse = average(responseGapMs);

  const monthLabel = new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
  }).format(now);

  return {
    unresolved: open + inProgress,
    // No due-date field in schema yet — keep cards for UI parity.
    overdue: 0,
    dueToday: 0,
    open,
    onHold: 0,
    resolvedThisMonth,
    receivedThisMonth,
    avgFirstResponseLabel: avgFirst === null ? "—" : formatDuration(avgFirst),
    avgResponseLabel:
      avgResponse === null ? "—" : formatDuration(avgResponse),
    monthLabel,
    trendByDay,
    daysInMonth: dayCount,
  };
}
