import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/app/lib/auth";
import { AppShell } from "@/app/components/app-shell";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const userName =
    session.user.name?.trim() || session.user.email || "Account";

  return (
    <AppShell userName={userName} isAdmin={session.user.role === "ADMIN"}>
      {children}
    </AppShell>
  );
}
