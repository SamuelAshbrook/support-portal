"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/app/lib/auth-client";

export function SignOutButton() {
    const router = useRouter();

    async function handleSignOut() {
        await authClient.signOut();
        router.push("/login");
    }

    return (
        <button
            onClick={handleSignOut}
            className="rounded-md bg-black py-2 px-4 text-white hover:bg-gray-800 cursor-pointer"
        >
            Sign out
        </button>
    )
}