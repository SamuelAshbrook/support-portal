"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/app/lib/auth-client";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const { error } = await authClient.signIn.email({
            email,
            password,
        });

        setLoading(false);
        if (error) {
            setError(error.message ?? "Invalid email or password");
            return;
        }
        router.push("/");
    }

    return (
        <div className="flex flex-1 items-center justify-center p-6">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-sm space-y-4 rounded-xl border border-zinc-200 p-8 shadow-sm"
            >
                <h1 className="text-2xl font-semibold">Log in to your account</h1>

                {error && <p className="text-sm text-red-600">{error}</p>}

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="border-[#E4DDDD] border border-solid px-5 py-2.5 bg-[#f9f3f3] font-figtree text-base box-border w-full rounded-none placeholder:text-[#513838]"
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="border-[#E4DDDD] border border-solid px-5 py-2.5 bg-[#f9f3f3] font-figtree text-base box-border w-full rounded-none placeholder:text-[#513838]"
                />

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-md py-2 font-medium disabled:opacity-50 text-white bg-[#bf2c53]"
                >
                    {loading ? "Logging in..." : "Log in"}
                </button>
            </form>
        </div>
    );
}