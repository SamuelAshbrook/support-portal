"use client";

import { useActionState, useState } from "react";
import {
    deleteCompany,
    updateCompany,
    type CompanyActionState,
} from "./actions";
import { useCompanyNameCheck } from "./use-company-name-check";

type CompanyListItemProps = {
    id: string;
    name: string;
    userCount: number;
    ticketCount: number;
    timesheetCount: number;
};

export function CompanyListItem({
    id,
    name,
    userCount,
    ticketCount,
    timesheetCount,
}: CompanyListItemProps) {
    const [isEditing, setIsEditing] = useState(false);
    const {
        name: editName,
        nameExists,
        checkingName,
        handleNameChange,
        resetName,
    } = useCompanyNameCheck({
        initialName: name,
        excludeCompanyId: id,
        enabled: isEditing,
    });

    async function submitUpdate(
        prevState: CompanyActionState | null,
        formData: FormData,
    ): Promise<CompanyActionState> {
        const result = await updateCompany(prevState, formData);
        if (result.success) setIsEditing(false);
        return result;
    }

    const [updateState, updateAction, updatePending] = useActionState<
        CompanyActionState | null,
        FormData
    >(submitUpdate, null);

    const [deleteState, deleteAction, deletePending] = useActionState<
        CompanyActionState | null,
        FormData
    >(deleteCompany, null);

    function startEditing() {
        resetName(name);
        setIsEditing(true);
    }

    function cancelEditing() {
        resetName(name);
        setIsEditing(false);
    }

    const trimmedEditName = editName.trim();
    const nameUnchanged =
        trimmedEditName.toLowerCase() === name.trim().toLowerCase();
    const showDuplicateMessage =
        isEditing && trimmedEditName.length > 0 && !checkingName && nameExists;
    const canSave =
        trimmedEditName.length > 0 &&
        !nameExists &&
        !checkingName &&
        !updatePending &&
        !nameUnchanged;

    const canDelete =
        userCount === 0 && ticketCount === 0 && timesheetCount === 0;

    const countsLabel = `${userCount} users, ${ticketCount} tickets, ${timesheetCount} timesheets`;

    if (isEditing) {
        return (
            <li className="space-y-2 p-4">
                <form action={updateAction} className="space-y-2">
                    <input type="hidden" name="id" value={id} />
                    <div className="flex flex-wrap gap-2">
                        <input
                            type="text"
                            name="name"
                            value={editName}
                            onChange={(event) =>
                                handleNameChange(event.target.value)
                            }
                            className="min-w-0 flex-1 rounded-md border border-zinc-300 p-2"
                            disabled={updatePending}
                        />
                        <button
                            type="submit"
                            disabled={!canSave}
                            className="rounded-md bg-blue-500 px-4 py-2 text-white disabled:opacity-50"
                        >
                            {updatePending ? "Saving..." : "Save"}
                        </button>
                        <button
                            type="button"
                            onClick={cancelEditing}
                            disabled={updatePending}
                            className="rounded-md border border-zinc-300 px-4 py-2 disabled:opacity-50"
                        >
                            Cancel
                        </button>
                    </div>

                    {showDuplicateMessage && (
                        <p className="text-sm text-red-600">
                            Company already exists
                        </p>
                    )}

                    {updateState?.error && (
                        <p className="text-sm text-red-600">{updateState.error}</p>
                    )}
                </form>
            </li>
        );
    }

    return (
        <li className="flex flex-wrap items-center justify-between gap-2 p-4">
            <div className="space-y-1">
                <span className="font-medium">{name}</span>
                <p className="text-sm text-zinc-500">{countsLabel}</p>
                {deleteState?.error && (
                    <p className="text-sm text-red-600">{deleteState.error}</p>
                )}
            </div>

            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={startEditing}
                    className="rounded-md border border-zinc-300 px-4 py-2 text-sm"
                >
                    Edit
                </button>

                <form action={deleteAction}>
                    <input type="hidden" name="id" value={id} />
                    <button
                        type="submit"
                        disabled={!canDelete || deletePending}
                        title={
                            canDelete
                                ? `Delete ${name}`
                                : "Remove linked users, tickets, and timesheets before deleting"
                        }
                        onClick={(event) => {
                            if (!canDelete || !window.confirm(`Delete ${name}?`)) {
                                event.preventDefault();
                            }
                        }}
                        className="rounded-md border border-red-300 px-4 py-2 text-sm text-red-600 disabled:opacity-50"
                    >
                        {deletePending ? "Deleting..." : "Delete"}
                    </button>
                </form>
            </div>
        </li>
    );
}
