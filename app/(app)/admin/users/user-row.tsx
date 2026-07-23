"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useActionState, useState } from "react";
import { deleteUser, type UserActionState } from "./actions";
import { UserFormDialog } from "./user-form-dialog";
import type { CompanyOption } from "./user-form-inputs";

export type UserRowProps = {
    id: string;
    name: string;
    email: string;
    telephone: string;
    companyId: string | null;
    companyName: string | null;
    companies: CompanyOption[];
};

export function UserRow({
    id,
    name,
    email,
    telephone,
    companyId,
    companyName,
    companies,
}: UserRowProps) {
    const [editOpen, setEditOpen] = useState(false);

    const [deleteState, deleteAction, deletePending] = useActionState<
        UserActionState | null,
        FormData
    >(deleteUser, null);

    return (
        <>
            <tr className="border-b border-zinc-200 last:border-b-0">
                <td className="px-6 py-5 align-middle text-sm font-semibold text-zinc-900">
                    {name || "-"}
                </td>
                <td className="px-6 py-5 align-middle text-sm text-zinc-500">
                    {email}
                </td>
                <td className="whitespace-nowrap px-6 py-5 align-middle text-sm text-zinc-500">
                    {telephone || "-"}
                </td>
                <td className="px-6 py-5 align-middle text-sm text-zinc-500">
                    {companyName ?? "-"}
                </td>
                <td className="px-6 py-5 align-middle">
                    <div className="flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setEditOpen(true)}
                            title={`Edit ${name || email}`}
                            className="cursor-pointer text-zinc-600 hover:text-zinc-900"
                        >
                            <Pencil className="size-4" aria-hidden />
                            <span className="sr-only">
                                Edit {name || email}
                            </span>
                        </button>

                        <form action={deleteAction} className="inline">
                            <input type="hidden" name="id" value={id} />
                            <button
                                type="submit"
                                disabled={deletePending}
                                title={`Delete ${name || email}`}
                                onClick={(event) => {
                                    if (
                                        !window.confirm(
                                            `Delete ${name || email}?`,
                                        )
                                    ) {
                                        event.preventDefault();
                                    }
                                }}
                                className="cursor-pointer text-zinc-600 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <Trash2 className="size-4" aria-hidden />
                                <span className="sr-only">
                                    Delete {name || email}
                                </span>
                            </button>
                        </form>
                    </div>
                    {deleteState?.error && (
                        <p className="mt-2 text-right text-xs text-red-600">
                            {deleteState.error}
                        </p>
                    )}
                </td>
            </tr>

            <UserFormDialog
                open={editOpen}
                onClose={() => setEditOpen(false)}
                mode="edit"
                companies={companies}
                initial={{
                    id,
                    name,
                    email,
                    telephone,
                    companyId: companyId ?? "",
                }}
            />
        </>
    );
}
