import { requireUser } from "@/app/lib/session";
import { getDashboardStats } from "@/app/lib/dashboard-stats";
import { DashboardView } from "./dashboard/dashboard-view";

export default async function Home() {
  const user = await requireUser();
  const isAdmin = user.role === "ADMIN";

  const stats = await getDashboardStats(
    isAdmin ? undefined : (user.companyId ?? null),
  );

  return (
    <DashboardView
      stats={stats}
      subtitle={
        isAdmin
          ? "Overview of your support desk"
          : "Overview of your company's support desk"
      }
    />
  );
}
