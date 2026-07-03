"use client";

import { useActionState, useEffect, useState } from "react";
import {
    checkCompanyNameExists,
    createCompany,
    type CreateCompanyState,
} from "./actions";

const DEBOUNCE_MS = 400;

export function CreateCompanyForm() {
    const [name, setName] = useState("");
    const [nameExists, setNameExists] = useState(false);
    const [checkingName, setCheckingName] = useState(false);

    async function submitCompany(
        prevState: CreateCompanyState | null,
        formData: FormData,
    ): Promise<CreateCompanyState> {
        const result = await createCompany(prevState, formData);
        if (result.success) {
            setName("");
            setNameExists(false);
            setCheckingName(false);
        }
        return result;
    }

    const [state, formAction, pending] = useActionState<
        CreateCompanyState | null,
        FormData
    >(submitCompany, null);

    function handleNameChange(value: string) {
        setName(value);
        const trimmed = value.trim();
        if (!trimmed) {
            setNameExists(false);
            setCheckingName(false);
            return;
        }
        setCheckingName(true);
    }

    useEffect(() => {
        const trimmed = name.trim();
        if (!trimmed) return;

        const timer = window.setTimeout(async () => {
            const exists = await checkCompanyNameExists(trimmed);
            setNameExists(exists);
            setCheckingName(false);
        }, DEBOUNCE_MS);

        return () => window.clearTimeout(timer);
    }, [name]);

    const trimmedName = name.trim();
    const showDuplicateMessage =
        trimmedName.length > 0 && !checkingName && nameExists;
    const canSubmit =
        trimmedName.length > 0 && !nameExists && !checkingName && !pending;

    return (
        <form action={formAction} className="space-y-2">
            <div className="flex gap-2">
                <input
                    type="text"
                    name="name"
                    value={name}
                    onChange={(event) => handleNameChange(event.target.value)}
                    placeholder="Company Name"
                    className="w-full rounded-md border border-zinc-300 p-2"
                    disabled={pending}
                />
                <button
                    type="submit"
                    disabled={!canSubmit}
                    className="w-full rounded-md bg-blue-500 text-white p-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {pending ? "Creating..." : "Create Company"}
                </button>
            </div>

            {showDuplicateMessage && (
                <p className="text-sm text-red-600">Company already exists</p>
            )}

            {state?.error && (
                <p className="text-sm text-red-600">{state.error}</p>
            )}

            {state?.success && (
                <p className="text-sm text-green-700">
                    Company created successfully
                </p>
            )}
        </form>
    );
}
