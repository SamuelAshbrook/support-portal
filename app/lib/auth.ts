// Configuration for Better Auth
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";
import prisma from "./prisma";
import { accessControl, ADMIN, CLIENT } from "./permissions";

const trustedOrigins = [
    "http://localhost:3000",
    "https://*.vercel.app",
    process.env.BETTER_AUTH_URL,
    process.env.APP_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
].filter((origin): origin is string => Boolean(origin));

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    trustedOrigins,
    emailAndPassword: {
        enabled: true,
        disableSignUp: true,
    },
    user: {
        additionalFields: {
            companyId: { type: "string", required: false, input: false },
            telephone: { type: "string", required: false, input: false },
        },
    },
    plugins: [
        admin({
            ac: accessControl,
            roles: { ADMIN, CLIENT },
            adminRoles: ["ADMIN"],
            defaultRole: "CLIENT",
        }),
        nextCookies(),
    ],
});
