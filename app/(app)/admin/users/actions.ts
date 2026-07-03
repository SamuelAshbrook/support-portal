"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/app/lib/auth";
import prisma from "@/app/lib/prisma";
import { assertAdmin } from "@/app/lib/session";

export type CreateUserState = {
    error?: string;
    success?: boolean;
};

async function findUserByEmail(email: string) {
    return prisma.user.findFirst({
        where: { email: { equals: email, mode: "insensitive" } },
    });
}

export async function checkUserEmailExists(email: string): Promise<boolean> {
    await assertAdmin();
    const trimmed = email.trim();
    if (!trimmed) return false;
    return (await findUserByEmail(trimmed)) !== null;
}

export async function createClientUser(
    _prevState: CreateUserState | null,
    formData: FormData,
): Promise<CreateUserState> {
    await assertAdmin();

    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const companyId = String(formData.get("companyId") ?? "");

    if (!name || !email || !password || !companyId)
        return { error: "All fields are required" };

    if (await findUserByEmail(email))
        return { error: "User already exists" };

    try {
        await auth.api.createUser({
            body: {
                name,
                email,
                password,
                role: "CLIENT",
                data: { companyId },
            },
            headers: await headers(),
        });
    } catch {
        return { error: "User already exists" };
    }

    revalidatePath("/admin/users");
    return { success: true };
}
