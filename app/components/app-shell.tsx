"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Building2,
  Clock,
  Home,
  LogOut,
  PanelLeft,
  Ticket,
  User,
  Users,
} from "lucide-react";
import { authClient } from "@/app/lib/auth-client";

type AppShellProps = {
  children: React.ReactNode;
  userName: string;
  isAdmin: boolean;
};

type NavItem = {
  label: string;
  href?: string;
  icon: typeof Home;
  disabled?: boolean;
  adminOnly?: boolean;
};

const mainNav: NavItem[] = [
  { label: "Dashboard", href: "/", icon: Home },
  { label: "Tickets", href: "/tickets", icon: Ticket },
  { label: "Companies", href: "/admin/companies", icon: Building2, adminOnly: true },
  { label: "Users", href: "/admin/users", icon: Users, adminOnly: true },
  { label: "Timesheets", icon: Clock, disabled: true },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({ children, userName, isAdmin }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const visibleNav = mainNav.filter((item) => !item.adminOnly || isAdmin);

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/login");
  }

  return (
    <div className="flex min-h-screen bg-[#f7f7f8]">
      <aside
        className={[
          "fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-[#e8eaed] bg-white transition-transform duration-200 ease-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
        aria-hidden={!sidebarOpen}
      >
        <div className="flex flex-1 flex-col px-3 py-4">
          <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wide text-zinc-400">
            Main
          </p>
          <nav className="flex flex-col gap-0.5" aria-label="Main">
            {visibleNav.map((item) => {
              const Icon = item.icon;

              if (item.disabled || !item.href) {
                return (
                  <span
                    key={item.label}
                    aria-disabled="true"
                    title="Coming soon"
                    className="flex cursor-not-allowed items-center gap-2.5 rounded-md px-3 py-2 text-sm text-zinc-300"
                  >
                    <Icon className="size-4 shrink-0" strokeWidth={1.75} />
                    {item.label}
                  </span>
                );
              }

              const active = isActivePath(pathname, item.href);

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={[
                    "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-zinc-100 font-medium text-zinc-900"
                      : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900",
                  ].join(" ")}
                >
                  <Icon className="size-4 shrink-0" strokeWidth={1.75} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-[#e8eaed] px-3 py-3">
          <div className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-zinc-600">
            <User className="size-4 shrink-0" strokeWidth={1.75} />
            <span className="truncate">{userName}</span>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full cursor-pointer items-center gap-2.5 rounded-md px-3 py-2 text-sm text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-900"
          >
            <LogOut className="size-4 shrink-0" strokeWidth={1.75} />
            Logout
          </button>
        </div>
      </aside>

      {sidebarOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/20 md:hidden"
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      <div
        className={[
          "flex min-h-screen min-w-0 flex-1 flex-col transition-[padding] duration-200 ease-out",
          sidebarOpen ? "md:pl-60" : "md:pl-0",
        ].join(" ")}
      >
        <header className="sticky top-0 z-20 flex h-12 items-center gap-3 border-b border-[#e8eaed] bg-white px-4">
          <button
            type="button"
            onClick={() => setSidebarOpen((open) => !open)}
            className="inline-flex size-8 cursor-pointer items-center justify-center rounded-md text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
            aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
            aria-expanded={sidebarOpen}
          >
            <PanelLeft className="size-4" strokeWidth={1.75} />
          </button>
          <span className="text-sm font-medium text-zinc-800">
            Step3 Support
          </span>
        </header>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
