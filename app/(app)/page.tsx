import { requireUser } from "@/app/lib/session";
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

  const stats = await getClientDashboardStats(user.companyId);
  return <ClientDashboard stats={stats} />;
}
