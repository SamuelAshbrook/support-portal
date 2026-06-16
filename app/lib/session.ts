import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/app/lib/auth";

// Raw session lookup
export async function getSession() {
    return auth.api.getSession({ headers: await headers() });
}

// Require a user
export async function requireUser() {
    const session = await getSession();
    if (!session)
        redirect("/login");
    return session.user;
}

// Require an admin user
export async function requireAdmin() {
    const user = await requireUser();
    if (user.role !== "ADMIN")
        redirect("/");
    return user;
}

export async function assertAdmin() {
    const session = await getSession();
    if (!session || session.user.role !== "ADMIN")
        throw new Error("Unauthorized");
    return session.user;
}