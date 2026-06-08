import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import prisma from "./prisma";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: { enabled: true },
    user: {
        additionalFields: {
            role: { type: "string", defaultValue: "CLIENT", input: false },
            companyId: { type: "string", required: false, input: false },
        },
    },
    plugins: [nextCookies()],
});