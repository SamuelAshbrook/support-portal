import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/app/lib/auth";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || session.user.role !== "ADMIN") {
        redirect("/");
    }

    return <div className="p-6">{children}</div>
}