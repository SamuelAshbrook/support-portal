"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import prisma from "@/app/lib/prisma";
import { auth } from "@/app/lib/auth";

async function assertAdmin() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || session.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }
}

export async function createCompany(formData: FormData) {
    await assertAdmin();
    const name = String(formData.get("name") ?? "").trim();
    if (!name)
        throw new Error("Company name is required");

    await prisma.company.create({ data: { name } });
    revalidatePath("/admin/companies");
}