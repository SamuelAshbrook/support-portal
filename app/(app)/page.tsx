import { requireUser } from "@/app/lib/session";
import prisma from "@/app/lib/prisma";
import {
  getClientDashboardStats,
  getDashboardStats,
} from "@/app/lib/dashboard-stats";
import { ClientDashboard } from "./dashboard/client-dashboard";
import { DashboardView } from "./dashboard/dashboard-view";

export default async function Home() {
  const user = await requireUser();
  const isAdmin = user.role === "ADMIN";

  if (isAdmin) {
    const stats = await getDashboardStats();
    return <DashboardView stats={stats} />;
  }

  const [stats, company] = await Promise.all([
    getClientDashboardStats(user.companyId),
    user.companyId
      ? prisma.company.findUnique({
          where: { id: user.companyId },
          select: { name: true },
        })
      : Promise.resolve(null),
  ]);

  return (
    <ClientDashboard stats={stats} companyName={company?.name ?? null} />
  );
}
