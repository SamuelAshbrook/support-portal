"use client";

import { useActionState, useRef, useState } from "react";
import { createClientUser, type UserActionState } from "./actions";
import { useUserEmailCheck } from "./use-user-email-check";
import { PASSWORD_MAX, validatePassword } from "./password";

type CompanyOption = {
    id: string;
    name: string;
};

export function CreateUserForm({ companies }: { companies: CompanyOption[] }) {
    const formRef = useRef<HTMLFormElement>(null);
    const [password, setPassword] = useState("");
    const { email, emailExists, checkingEmail, handleEmailChange, resetEmail } =
        useUserEmailCheck();

    async function submitUser(
        prevState: UserActionState | null,
        formData: FormData,
    ): Promise<UserActionState> {
        const result = await createClientUser(prevState, formData);
        if (result.success) {
            formRef.current?.reset();
            resetEmail();
            setPassword("");
        }
        return result;
    }

    const [state, formAction, pending] = useActionState<
        UserActionState | null,
        FormData
    >(submitUser, null);

    const showDuplicateMessage =
        email.trim().length > 0 && !checkingEmail && emailExists;
    const passwordError = password.length > 0 ? validatePassword(password) : null;
    const canSubmit =
        !emailExists &&
        !checkingEmail &&
        !pending &&
        password.length > 0 &&
        passwordError === null;

    return (
        <form ref={formRef} action={formAction} className="grid max-w-md gap-2">
            <input
                name="name"
                placeholder="Name"
                required
                disabled={pending}
                className="w-full rounded-md border border-zinc-300 p-2"
            />
            <input
                name="email"
                type="email"
                placeholder="Email"
                required
                value={email}
                onChange={(event) => handleEmailChange(event.target.value)}
                disabled={pending}
                className="w-full rounded-md border border-zinc-300 p-2"
            />
            <input
                name="telephone"
                type="tel"
                placeholder="Telephone"
                required
                disabled={pending}
                className="w-full rounded-md border border-zinc-300 p-2"
            />
            <input
                name="password"
                type="password"
                placeholder="Temp Password"
                required
                maxLength={PASSWORD_MAX}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={pending}
                className="w-full rounded-md border border-zinc-300 p-2"
            />
            <p className="text-xs text-red-500">
                Min 8 characters, at least 1 number and 1 symbol.
            </p>
            {passwordError && (
                <p className="text-sm text-red-600">{passwordError}</p>
            )}
            <select
                name="companyId"
                required
                disabled={pending}
                className="w-full rounded-md border border-zinc-300 p-2"
            >
                <option value="">Select Company</option>
                {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                        {company.name}
                    </option>
                ))}
            </select>
            <button
                type="submit"
                disabled={!canSubmit}
                className="w-full rounded-md bg-blue-500 text-white p-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {pending ? "Creating..." : "Create Client User"}
            </button>

            {showDuplicateMessage && (
                <p className="text-sm text-red-600">User already exists</p>
            )}

            {state?.error && (
                <p className="text-sm text-red-600">{state.error}</p>
            )}

            {state?.success && (
                <p className="text-sm text-green-700">
                    Client user created successfully
                </p>
            )}
        </form>
    );
}
