"use client";

import { useActionState, useState } from "react";
import { deleteUser, updateUser, type UserActionState } from "./actions";
import { useUserEmailCheck } from "./use-user-email-check";

type CompanyOption = {
    id: string;
    name: string;
};

type UserListItemProps = {
    id: string;
    name: string;
    email: string;
    telephone: string;
    role: string;
    companyId: string | null;
    companyName: string | null;
    companies: CompanyOption[];
};

export function UserListItem({
    id,
    name,
    email,
    telephone,
    role,
    companyId,
    companyName,
    companies,
}: UserListItemProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(name);
    const [editTelephone, setEditTelephone] = useState(telephone);
    const [editCompanyId, setEditCompanyId] = useState(companyId ?? "");
    const {
        email: editEmail,
        emailExists,
        checkingEmail,
        handleEmailChange,
        resetEmail,
    } = useUserEmailCheck({
        initialEmail: email,
        excludeUserId: id,
        enabled: isEditing,
    });

    async function submitUpdate(
        prevState: UserActionState | null,
        formData: FormData,
    ): Promise<UserActionState> {
        const result = await updateUser(prevState, formData);
        if (result.success) setIsEditing(false);
        return result;
    }

    const [updateState, updateAction, updatePending] = useActionState<
        UserActionState | null,
        FormData
    >(submitUpdate, null);

    const [deleteState, deleteAction, deletePending] = useActionState<
        UserActionState | null,
        FormData
    >(deleteUser, null);

    function startEditing() {
        setEditName(name);
        setEditTelephone(telephone);
        setEditCompanyId(companyId ?? "");
        resetEmail(email);
        setIsEditing(true);
    }

    function cancelEditing() {
        setEditName(name);
        setEditTelephone(telephone);
        setEditCompanyId(companyId ?? "");
        resetEmail(email);
        setIsEditing(false);
    }

    const trimmedName = editName.trim();
    const trimmedEmail = editEmail.trim();
    const trimmedTelephone = editTelephone.trim();
    const unchanged =
        trimmedName === name.trim() &&
        trimmedEmail.toLowerCase() === email.trim().toLowerCase() &&
        trimmedTelephone === telephone.trim() &&
        editCompanyId === (companyId ?? "");
    const showDuplicateMessage =
        isEditing && trimmedEmail.length > 0 && !checkingEmail && emailExists;
    const canSave =
        trimmedName.length > 0 &&
        trimmedEmail.length > 0 &&
        trimmedTelephone.length > 0 &&
        editCompanyId.length > 0 &&
        !emailExists &&
        !checkingEmail &&
        !updatePending &&
        !unchanged;

    if (isEditing) {
        return (
            <li className="space-y-2 p-4">
                <form action={updateAction} className="grid max-w-md gap-2">
                    <input type="hidden" name="id" value={id} />
                    <input
                        name="name"
                        value={editName}
                        onChange={(event) => setEditName(event.target.value)}
                        placeholder="Name"
                        required
                        disabled={updatePending}
                        className="w-full rounded-md border border-zinc-300 p-2"
                    />
                    <input
                        name="email"
                        type="email"
                        value={editEmail}
                        onChange={(event) =>
                            handleEmailChange(event.target.value)
                        }
                        placeholder="Email"
                        required
                        disabled={updatePending}
                        className="w-full rounded-md border border-zinc-300 p-2"
                    />
                    <input
                        name="telephone"
                        type="tel"
                        value={editTelephone}
                        onChange={(event) =>
                            setEditTelephone(event.target.value)
                        }
                        placeholder="Telephone"
                        required
                        disabled={updatePending}
                        className="w-full rounded-md border border-zinc-300 p-2"
                    />
                    <select
                        name="companyId"
                        value={editCompanyId}
                        onChange={(event) =>
                            setEditCompanyId(event.target.value)
                        }
                        required
                        disabled={updatePending}
                        className="w-full rounded-md border border-zinc-300 p-2"
                    >
                        <option value="">Select Company</option>
                        {companies.map((company) => (
                            <option key={company.id} value={company.id}>
                                {company.name}
                            </option>
                        ))}
                    </select>

                    <div className="flex gap-2">
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
                            User already exists
                        </p>
                    )}

                    {updateState?.error && (
                        <p className="text-sm text-red-600">
                            {updateState.error}
                        </p>
                    )}
                </form>
            </li>
        );
    }

    return (
        <li className="flex flex-wrap items-center justify-between gap-2 p-4">
            <div className="space-y-1">
                <span>
                    {name} - {email}
                </span>
                <p className="text-sm text-zinc-500">
                    {telephone || "-"} . {role} . {companyName ?? "-"}
                </p>
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
                        disabled={deletePending}
                        title={`Delete ${name}`}
                        onClick={(event) => {
                            if (!window.confirm(`Delete ${name}?`)) {
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
