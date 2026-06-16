"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/app/lib/auth";
import { assertAdmin } from "@/app/lib/session";

export async function createClientUser(formData: FormData) {
    await assertAdmin();
    
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const companyId = String(formData.get("companyId") ?? "");

    if (!name || !email || !password || !companyId)
        throw new Error("All fields are required");

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

    revalidatePath("/admin/users");
}