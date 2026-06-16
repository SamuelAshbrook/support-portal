import { requireAdmin } from "@/app/lib/session";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    await requireAdmin();

    return <div className="p-6">{children}</div>
}