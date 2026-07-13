"use client";

import { X } from "lucide-react";
import {
    useActionState,
    useEffect,
    useId,
    useRef,
    useState,
    useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";
import {
    createCompany,
    updateCompany,
    type CompanyActionState,
} from "./actions";
import {
    CompanyFormInputs,
    type CompanyAddressValues,
} from "./company-form-inputs";
import { isValidBillingRate } from "./company-fields";
import { useCompanyNameCheck } from "./use-company-name-check";

export type CompanyFormInitialValues = {
    id: string;
    name: string;
    billingRate: string;
    address: CompanyAddressValues;
};

const EMPTY_ADDRESS: CompanyAddressValues = {
    addressLine1: "",
    addressLine2: "",
    townCity: "",
    countyState: "",
    postcodeZip: "",
    country: "",
};

const emptySubscribe = () => () => {};

function useIsClient() {
    return useSyncExternalStore(emptySubscribe, () => true, () => false);
}

type CompanyFormDialogProps = {
    open: boolean;
    onClose: () => void;
    mode: "create" | "edit";
    initial?: CompanyFormInitialValues;
};

export function CompanyFormDialog({
    open,
    onClose,
    mode,
    initial,
}: CompanyFormDialogProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const titleId = useId();
    const formKey = initial?.id ?? "create";
    const mounted = useIsClient();

    useEffect(() => {
        if (!open) return;
        const dialog = dialogRef.current;
        if (dialog && !dialog.open) dialog.showModal();
    }, [open, mounted]);

    if (!mounted || !open) return null;

    return createPortal(
        <dialog
            ref={dialogRef}
            aria-labelledby={titleId}
            onClose={onClose}
            onClick={(event) => {
                if (event.target === dialogRef.current) onClose();
            }}
            className="m-auto w-[min(100%,32rem)] max-h-[min(100%,90vh)] overflow-y-auto rounded-xl border-0 bg-white p-0 shadow-xl backdrop:bg-black/45"
        >
            <CompanyFormDialogContent
                key={formKey}
                titleId={titleId}
                mode={mode}
                initial={initial}
                onClose={onClose}
            />
        </dialog>,
        document.body,
    );
}

function CompanyFormDialogContent({
    titleId,
    mode,
    initial,
    onClose,
}: {
    titleId: string;
    mode: "create" | "edit";
    initial?: CompanyFormInitialValues;
    onClose: () => void;
}) {
    const isEdit = mode === "edit";
    const [billingRate, setBillingRate] = useState(
        initial?.billingRate ?? "",
    );
    const [address, setAddress] = useState<CompanyAddressValues>(
        initial?.address ?? EMPTY_ADDRESS,
    );
    const { name, nameExists, checkingName, handleNameChange } =
        useCompanyNameCheck({
            initialName: initial?.name ?? "",
            excludeCompanyId: initial?.id,
            enabled: true,
        });

    async function submitForm(
        prevState: CompanyActionState | null,
        formData: FormData,
    ): Promise<CompanyActionState> {
        const result = isEdit
            ? await updateCompany(prevState, formData)
            : await createCompany(prevState, formData);
        if (result.success) onClose();
        return result;
    }

    const [state, formAction, pending] = useActionState<
        CompanyActionState | null,
        FormData
    >(submitForm, null);

    function handleAddressChange(
        field: keyof CompanyAddressValues,
        value: string,
    ) {
        setAddress((current) => ({ ...current, [field]: value }));
    }

    const trimmedName = name.trim();
    const trimmedRate = billingRate.trim();
    const showDuplicateMessage =
        trimmedName.length > 0 && !checkingName && nameExists;
    const billingRateValid = isValidBillingRate(trimmedRate);

    const originalAddress = initial?.address ?? EMPTY_ADDRESS;
    const unchanged =
        isEdit &&
        trimmedName.toLowerCase() ===
            (initial?.name ?? "").trim().toLowerCase() &&
        trimmedRate === (initial?.billingRate ?? "").trim() &&
        address.addressLine1.trim() === originalAddress.addressLine1.trim() &&
        address.addressLine2.trim() === originalAddress.addressLine2.trim() &&
        address.townCity.trim() === originalAddress.townCity.trim() &&
        address.countyState.trim() === originalAddress.countyState.trim() &&
        address.postcodeZip.trim() === originalAddress.postcodeZip.trim() &&
        address.country === originalAddress.country;

    const canSubmit =
        trimmedName.length > 0 &&
        billingRateValid &&
        !nameExists &&
        !checkingName &&
        !pending &&
        !unchanged;

    return (
        <form action={formAction} className="p-6 sm:p-7">
            {isEdit ? (
                <input type="hidden" name="id" value={initial?.id} />
            ) : null}

            <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                    <h2
                        id={titleId}
                        className="text-xl font-bold text-zinc-800"
                    >
                        {isEdit ? "Edit Company" : "Add New Company"}
                    </h2>
                    <p className="mt-1 text-sm text-zinc-500">
                        {isEdit
                            ? "Update this company record"
                            : "Create a new company record"}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    disabled={pending}
                    className="cursor-pointer rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Close"
                >
                    <X className="size-5" strokeWidth={1.75} />
                </button>
            </div>

            <CompanyFormInputs
                disabled={pending}
                name={{ value: name, onChange: handleNameChange }}
                billingRate={{ value: billingRate, onChange: setBillingRate }}
                address={{ values: address, onChange: handleAddressChange }}
            />

            {(showDuplicateMessage ||
                (trimmedRate.length > 0 && !billingRateValid) ||
                state?.error) && (
                <div className="mt-4 space-y-1">
                    {showDuplicateMessage && (
                        <p className="text-sm text-red-600">
                            Company already exists
                        </p>
                    )}
                    {trimmedRate.length > 0 && !billingRateValid && (
                        <p className="text-sm text-red-600">
                            Billing rate must be a number with up to 2 decimal
                            places
                        </p>
                    )}
                    {state?.error && (
                        <p className="text-sm text-red-600">{state.error}</p>
                    )}
                </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
                <button
                    type="button"
                    onClick={onClose}
                    disabled={pending}
                    className="cursor-pointer rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={!canSubmit}
                    className="cursor-pointer rounded-md bg-[#ee6b5d] px-4 py-2 text-sm font-medium text-white hover:bg-[#e55a4c] disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {pending
                        ? isEdit
                            ? "Updating..."
                            : "Adding..."
                        : isEdit
                          ? "Update Company"
                          : "Add Company"}
                </button>
            </div>
        </form>
    );
}
