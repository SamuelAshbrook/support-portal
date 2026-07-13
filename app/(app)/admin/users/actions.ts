"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/app/lib/auth";
import prisma from "@/app/lib/prisma";
import { assertAdmin } from "@/app/lib/session";
import { validatePassword } from "./password";

export type UserActionState = {
    error?: string;
    success?: boolean;
};

async function findUserByEmail(email: string, excludeUserId?: string) {
    return prisma.user.findFirst({
        where: {
            email: { equals: email, mode: "insensitive" },
            ...(excludeUserId ? { id: { not: excludeUserId } } : {}),
        },
    });
}

export async function checkUserEmailExists(
    email: string,
    excludeUserId?: string,
): Promise<boolean> {
    await assertAdmin();
    const trimmed = email.trim();
    if (!trimmed) return false;
    return (await findUserByEmail(trimmed, excludeUserId)) !== null;
}

export async function createClientUser(
    _prevState: UserActionState | null,
    formData: FormData,
): Promise<UserActionState> {
    await assertAdmin();

    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const telephone = String(formData.get("telephone") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const companyId = String(formData.get("companyId") ?? "");

    if (!name || !email || !telephone || !password || !companyId)
        return { error: "All fields are required" };

    const passwordError = validatePassword(password);
    if (passwordError)
        return { error: passwordError };

    if (await findUserByEmail(email))
        return { error: "User already exists" };

    try {
        await auth.api.createUser({
            body: {
                name,
                email,
                password,
                role: "CLIENT",
                data: { companyId, telephone },
            },
            headers: await headers(),
        });
    } catch {
        return { error: "User already exists" };
    }

    revalidatePath("/admin/users");
    return { success: true };
}

export async function updateUser(
    _prevState: UserActionState | null,
    formData: FormData,
): Promise<UserActionState> {
    await assertAdmin();

    const id = String(formData.get("id") ?? "").trim();
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const telephone = String(formData.get("telephone") ?? "").trim();
    const companyId = String(formData.get("companyId") ?? "").trim();

    if (!id)
        return { error: "User not found" };

    if (!name || !email || !telephone || !companyId)
        return { error: "All fields are required" };

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing)
        return { error: "User not found" };

    if (await findUserByEmail(email, id))
        return { error: "User already exists" };

    try {
        await auth.api.adminUpdateUser({
            body: { userId: id, data: { name, email, companyId, telephone } },
            headers: await headers(),
        });
    } catch {
        return { error: "Could not update user" };
    }

    revalidatePath("/admin/users");
    return { success: true };
}

export async function deleteUser(
    _prevState: UserActionState | null,
    formData: FormData,
): Promise<UserActionState> {
    await assertAdmin();

    const id = String(formData.get("id") ?? "").trim();
    if (!id)
        return { error: "User not found" };

    try {
        await auth.api.removeUser({
            body: { userId: id },
            headers: await headers(),
        });
    } catch {
        return {
            error: "Cannot delete this user (they may have linked tickets or messages)",
        };
    }

    revalidatePath("/admin/users");
    return { success: true };
}
