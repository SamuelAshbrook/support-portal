"use client";

import { useActionState } from "react";
import { createCompany, type CompanyActionState } from "./actions";
import { useCompanyNameCheck } from "./use-company-name-check";

export function CreateCompanyForm() {
    const { name, nameExists, checkingName, handleNameChange, resetName } =
        useCompanyNameCheck();

    async function submitCompany(
        prevState: CompanyActionState | null,
        formData: FormData,
    ): Promise<CompanyActionState> {
        const result = await createCompany(prevState, formData);
        if (result.success) resetName();
        return result;
    }

    const [state, formAction, pending] = useActionState<
        CompanyActionState | null,
        FormData
    >(submitCompany, null);

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
