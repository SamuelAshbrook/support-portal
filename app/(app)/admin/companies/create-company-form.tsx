"use client";

import { useActionState, useRef, useState } from "react";
import { createCompany, type CompanyActionState } from "./actions";
import {
    CompanyFormInputs,
    type CompanyAddressValues,
} from "./company-form-inputs";
import { isValidBillingRate } from "./company-fields";
import { useCompanyNameCheck } from "./use-company-name-check";

const EMPTY_ADDRESS: CompanyAddressValues = {
    addressLine1: "",
    addressLine2: "",
    townCity: "",
    countyState: "",
    postcodeZip: "",
    country: "",
};

export function CreateCompanyForm({
    onSuccess,
}: {
    onSuccess?: () => void;
} = {}) {
    const formRef = useRef<HTMLFormElement>(null);
    const [billingRate, setBillingRate] = useState("");
    const [address, setAddress] = useState<CompanyAddressValues>(EMPTY_ADDRESS);
    const { name, nameExists, checkingName, handleNameChange, resetName } =
        useCompanyNameCheck();

    function handleAddressChange(
        field: keyof CompanyAddressValues,
        value: string,
    ) {
        setAddress((current) => ({ ...current, [field]: value }));
    }

    async function submitCompany(
        prevState: CompanyActionState | null,
        formData: FormData,
    ): Promise<CompanyActionState> {
        const result = await createCompany(prevState, formData);
        if (result.success) {
            formRef.current?.reset();
            resetName();
            setBillingRate("");
            setAddress(EMPTY_ADDRESS);
            onSuccess?.();
        }
        return result;
    }

    const [state, formAction, pending] = useActionState<
        CompanyActionState | null,
        FormData
    >(submitCompany, null);

    const trimmedName = name.trim();
    const trimmedRate = billingRate.trim();
    const showDuplicateMessage =
        trimmedName.length > 0 && !checkingName && nameExists;
    const billingRateValid = isValidBillingRate(trimmedRate);
    const canSubmit =
        trimmedName.length > 0 &&
        billingRateValid &&
        !nameExists &&
        !checkingName &&
        !pending;

    return (
        <form ref={formRef} action={formAction} className="space-y-2">
            <CompanyFormInputs
                disabled={pending}
                name={{ value: name, onChange: handleNameChange }}
                billingRate={{ value: billingRate, onChange: setBillingRate }}
                address={{ values: address, onChange: handleAddressChange }}
            />

            <button
                type="submit"
                disabled={!canSubmit}
                className="w-full rounded-md bg-[#ee6b5d] p-2 text-white cursor-pointer hover:bg-[#e55a4c] disabled:cursor-not-allowed disabled:opacity-50"
            >
                {pending ? "Creating..." : "Create Company"}
            </button>

            {showDuplicateMessage && (
                <p className="text-sm text-red-600">Company already exists</p>
            )}

            {trimmedRate.length > 0 && !billingRateValid && (
                <p className="text-sm text-red-600">
                    Billing rate must be a number with up to 2 decimal places
                </p>
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
