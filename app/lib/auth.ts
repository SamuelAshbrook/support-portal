// Configuration for Better Auth
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";
import prisma from "./prisma";
import { accessControl, ADMIN, CLIENT } from "./permissions";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true,
        disableSignUp: true,
    },
    user: {
        additionalFields: {
            companyId: { type: "string", required: false, input: false },
        },
    },
    plugins: [
        admin({
            ac: accessControl,
            roles: {ADMIN, CLIENT},
            adminRoles: ["ADMIN"],
            defaultRole: "CLIENT",
        }),
        nextCookies(),
    ],
});