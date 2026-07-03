"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/app/lib/prisma";
import { assertAdmin } from "@/app/lib/session";

export type CreateCompanyState = {
    error?: string;
    success?: boolean;
};

async function findCompanyByName(name: string) {
    return prisma.company.findFirst({
        where: { name: { equals: name, mode: "insensitive" } },
    });
}

export async function checkCompanyNameExists(name: string): Promise<boolean> {
    await assertAdmin();
    const trimmed = name.trim();
    if (!trimmed) return false;
    return (await findCompanyByName(trimmed)) !== null;
}

export async function createCompany(
    _prevState: CreateCompanyState | null,
    formData: FormData,
): Promise<CreateCompanyState> {
    await assertAdmin();
    const name = String(formData.get("name") ?? "").trim();
    if (!name)
        return { error: "Company name is required" };

    if (await findCompanyByName(name))
        return { error: "Company already exists" };

    try {
        await prisma.company.create({ data: { name } });
    } catch {
        return { error: "Company already exists" };
    }

    revalidatePath("/admin/companies");
    return { success: true };
}
