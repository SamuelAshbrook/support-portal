"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useActionState, useState } from "react";
import { deleteCompany, type CompanyActionState } from "./actions";
import { CompanyFormDialog } from "./company-form-dialog";
import type { CompanyAddressValues } from "./company-form-inputs";
import { formatBillingRate } from "./company-fields";

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
    const [editOpen, setEditOpen] = useState(false);

    const [deleteState, deleteAction, deletePending] = useActionState<
        CompanyActionState | null,
        FormData
    >(deleteCompany, null);

    const canDelete =
        userCount === 0 && ticketCount === 0 && timesheetCount === 0;
    const address = formatAddress(props);

    return (
        <>
            <tr className="border-b border-zinc-200 last:border-b-0">
                <td className="px-6 py-5 align-middle text-sm font-semibold text-zinc-900">
                    {name}
                </td>
                <td className="max-w-xl px-6 py-5 align-middle text-sm text-zinc-500">
                    {address || "-"}
                </td>
                <td className="whitespace-nowrap px-6 py-5 align-middle text-sm text-zinc-500">
                    {formatBillingRate(billingRate)}
                </td>
                <td className="px-6 py-5 align-middle">
                    <div className="flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setEditOpen(true)}
                            title={`Edit ${name}`}
                            className="cursor-pointer text-zinc-600 hover:text-zinc-900"
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
                                className="cursor-pointer text-zinc-600 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-40"
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

            <CompanyFormDialog
                open={editOpen}
                onClose={() => setEditOpen(false)}
                mode="edit"
                initial={{
                    id,
                    name,
                    billingRate,
                    address: toAddressValues(props),
                }}
            />
        </>
    );
}
