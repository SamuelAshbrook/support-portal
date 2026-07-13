"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useActionState, useState } from "react";
import {
    deleteCompany,
    updateCompany,
    type CompanyActionState,
} from "./actions";
import {
    CompanyFormInputs,
    type CompanyAddressValues,
} from "./company-form-inputs";
import { formatBillingRate, isValidBillingRate } from "./company-fields";
import { useCompanyNameCheck } from "./use-company-name-check";

export type CompanyRowProps = {
    id: string;
    name: string;
    addressLine1: string | null;
    addressLine2: string | null;
    townCity: string | null;
    countyState: string | null;
    postcodeZip: string | null;
    country: string | null;
    billingRate: string;
    userCount: number;
    ticketCount: number;
    timesheetCount: number;
};

function toAddressValues(props: CompanyRowProps): CompanyAddressValues {
    return {
        addressLine1: props.addressLine1 ?? "",
        addressLine2: props.addressLine2 ?? "",
        townCity: props.townCity ?? "",
        countyState: props.countyState ?? "",
        postcodeZip: props.postcodeZip ?? "",
        country: props.country ?? "",
    };
}

function formatAddress(props: CompanyRowProps): string {
    return [
        props.addressLine1,
        props.addressLine2,
        props.townCity,
        props.countyState,
        props.postcodeZip,
        props.country,
    ]
        .filter(Boolean)
        .join(", ");
}

export function CompanyRow(props: CompanyRowProps) {
    const { id, name, billingRate, userCount, ticketCount, timesheetCount } =
        props;

    const [isEditing, setIsEditing] = useState(false);
    const [editBillingRate, setEditBillingRate] = useState(billingRate);
    const [editAddress, setEditAddress] = useState(() =>
        toAddressValues(props),
    );
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

    function handleAddressChange(
        field: keyof CompanyAddressValues,
        value: string,
    ) {
        setEditAddress((current) => ({ ...current, [field]: value }));
    }

    function startEditing() {
        resetName(name);
        setEditBillingRate(billingRate);
        setEditAddress(toAddressValues(props));
        setIsEditing(true);
    }

    function cancelEditing() {
        resetName(name);
        setEditBillingRate(billingRate);
        setEditAddress(toAddressValues(props));
        setIsEditing(false);
    }

    const originalAddress = toAddressValues(props);
    const trimmedEditName = editName.trim();
    const trimmedRate = editBillingRate.trim();
    const billingRateValid = isValidBillingRate(trimmedRate);
    const addressUnchanged =
        editAddress.addressLine1.trim() ===
            originalAddress.addressLine1.trim() &&
        editAddress.addressLine2.trim() ===
            originalAddress.addressLine2.trim() &&
        editAddress.townCity.trim() === originalAddress.townCity.trim() &&
        editAddress.countyState.trim() ===
            originalAddress.countyState.trim() &&
        editAddress.postcodeZip.trim() ===
            originalAddress.postcodeZip.trim() &&
        editAddress.country === originalAddress.country;
    const unchanged =
        trimmedEditName.toLowerCase() === name.trim().toLowerCase() &&
        trimmedRate === billingRate.trim() &&
        addressUnchanged;
    const showDuplicateMessage =
        isEditing && trimmedEditName.length > 0 && !checkingName && nameExists;
    const canSave =
        trimmedEditName.length > 0 &&
        billingRateValid &&
        !nameExists &&
        !checkingName &&
        !updatePending &&
        !unchanged;

    const canDelete =
        userCount === 0 && ticketCount === 0 && timesheetCount === 0;
    const address = formatAddress(props);

    if (isEditing) {
        return (
            <tr className="border-b border-zinc-200">
                <td colSpan={4} className="px-6 py-5">
                    <form action={updateAction} className="space-y-3">
                        <input type="hidden" name="id" value={id} />
                        <CompanyFormInputs
                            disabled={updatePending}
                            name={{
                                value: editName,
                                onChange: handleNameChange,
                            }}
                            billingRate={{
                                value: editBillingRate,
                                onChange: setEditBillingRate,
                            }}
                            address={{
                                values: editAddress,
                                onChange: handleAddressChange,
                            }}
                        />

                        <div className="flex gap-2">
                            <button
                                type="submit"
                                disabled={!canSave}
                                className="rounded-md bg-[#ee6b5d] px-4 py-2 text-sm text-white disabled:opacity-50"
                            >
                                {updatePending ? "Saving..." : "Save"}
                            </button>
                            <button
                                type="button"
                                onClick={cancelEditing}
                                disabled={updatePending}
                                className="rounded-md border border-zinc-300 px-4 py-2 text-sm disabled:opacity-50"
                            >
                                Cancel
                            </button>
                        </div>

                        {showDuplicateMessage && (
                            <p className="text-sm text-red-600">
                                Company already exists
                            </p>
                        )}

                        {trimmedRate.length > 0 && !billingRateValid && (
                            <p className="text-sm text-red-600">
                                Billing rate must be a number with up to 2
                                decimal places
                            </p>
                        )}

                        {updateState?.error && (
                            <p className="text-sm text-red-600">
                                {updateState.error}
                            </p>
                        )}
                    </form>
                </td>
            </tr>
        );
    }

    return (
        <tr className="border-b border-zinc-200 last:border-b-0">
            <td className="px-6 py-5 align-middle text-sm font-semibold text-zinc-900">
                {name}
            </td>
            <td className="max-w-xl px-6 py-5 align-middle text-sm text-zinc-500">
                {address || "—"}
            </td>
            <td className="whitespace-nowrap px-6 py-5 align-middle text-sm text-zinc-500">
                {formatBillingRate(billingRate)}
            </td>
            <td className="px-6 py-5 align-middle">
                <div className="flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={startEditing}
                        title={`Edit ${name}`}
                        className="text-zinc-600 hover:text-zinc-900"
                    >
                        <Pencil className="size-4" aria-hidden />
                        <span className="sr-only">Edit {name}</span>
                    </button>

                    <form action={deleteAction} className="inline">
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
                                if (
                                    !canDelete ||
                                    !window.confirm(`Delete ${name}?`)
                                ) {
                                    event.preventDefault();
                                }
                            }}
                            className="text-zinc-600 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <Trash2 className="size-4" aria-hidden />
                            <span className="sr-only">Delete {name}</span>
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
    );
}
