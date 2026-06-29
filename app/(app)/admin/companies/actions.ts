"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/app/lib/prisma";
import { assertAdmin } from "@/app/lib/session";

export async function createCompany(formData: FormData) {
    await assertAdmin();
    const name = String(formData.get("name") ?? "").trim();
    if (!name)
        throw new Error("Company name is required");

    await prisma.company.create({ data: { name } });
    revalidatePath("/admin/companies");
}