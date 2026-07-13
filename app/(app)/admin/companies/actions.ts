"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/app/lib/prisma";
import { assertAdmin } from "@/app/lib/session";
import {
    parseCompanyFormData,
    validateCompanyFields,
} from "./company-fields";

export type CompanyActionState = {
    error?: string;
    success?: boolean;
};

async function findCompanyByName(name: string, excludeCompanyId?: string) {
    return prisma.company.findFirst({
        where: {
            name: { equals: name, mode: "insensitive" },
            ...(excludeCompanyId ? { id: { not: excludeCompanyId } } : {}),
        },
    });
}

export async function checkCompanyNameExists(
    name: string,
    excludeCompanyId?: string,
): Promise<boolean> {
    await assertAdmin();
    const trimmed = name.trim();
    if (!trimmed) return false;
    return (await findCompanyByName(trimmed, excludeCompanyId)) !== null;
}

export async function createCompany(
    _prevState: CompanyActionState | null,
    formData: FormData,
): Promise<CompanyActionState> {
    await assertAdmin();

    const parsed = validateCompanyFields(parseCompanyFormData(formData));
    if ("error" in parsed) return { error: parsed.error };

    if (await findCompanyByName(parsed.data.name))
        return { error: "Company already exists" };

    try {
        await prisma.company.create({ data: parsed.data });
    } catch {
        return { error: "Company already exists" };
    }

    revalidatePath("/admin/companies");
    return { success: true };
}

export async function updateCompany(
    _prevState: CompanyActionState | null,
    formData: FormData,
): Promise<CompanyActionState> {
    await assertAdmin();
    const id = String(formData.get("id") ?? "").trim();
    if (!id) return { error: "Company not found" };

    const parsed = validateCompanyFields(parseCompanyFormData(formData));
    if ("error" in parsed) return { error: parsed.error };

    const company = await prisma.company.findUnique({ where: { id } });
    if (!company) return { error: "Company not found" };

    if (await findCompanyByName(parsed.data.name, id))
        return { error: "Company already exists" };

    try {
        await prisma.company.update({
            where: { id },
            data: parsed.data,
        });
    } catch {
        return { error: "Could not update company" };
    }

    revalidatePath("/admin/companies");
    return { success: true };
}

export async function deleteCompany(
    _prevState: CompanyActionState | null,
    formData: FormData,
): Promise<CompanyActionState> {
    await assertAdmin();
    const id = String(formData.get("id") ?? "").trim();
    if (!id) return { error: "Company not found" };

    const company = await prisma.company.findUnique({
        where: { id },
        include: {
            _count: { select: { users: true, tickets: true, timesheets: true } },
        },
    });

    if (!company) return { error: "Company not found" };

    if (
        company._count.users > 0 ||
        company._count.tickets > 0 ||
        company._count.timesheets > 0
    ) {
        return {
            error: "Cannot delete a company with linked users, tickets, or timesheets",
        };
    }

    try {
        await prisma.company.delete({ where: { id } });
    } catch {
        return { error: "Cannot delete a company with linked records" };
    }

    revalidatePath("/admin/companies");
    return { success: true };
}
