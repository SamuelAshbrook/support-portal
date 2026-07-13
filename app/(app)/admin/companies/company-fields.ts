import { isCountry } from "./countries";

export const ADDRESS_MAX = 100;
export const POSTCODE_MAX = 20;
export const BILLING_RATE_MAX = 999_999.99;

export type CompanyFormFields = {
    name: string;
    addressLine1: string;
    addressLine2: string;
    townCity: string;
    countyState: string;
    postcodeZip: string;
    country: string;
    billingRate: string;
};

export type ParsedCompanyFields = {
    name: string;
    addressLine1: string | null;
    addressLine2: string | null;
    townCity: string | null;
    countyState: string | null;
    postcodeZip: string | null;
    country: string | null;
    billingRate: string;
};

function optionalText(value: string, max: number, label: string): string | null {
    if (!value) return null;
    if (value.length > max) return `${label} must be ${max} characters or less`;
    return null;
}

export function parseCompanyFormData(formData: FormData): CompanyFormFields {
    return {
        name: String(formData.get("name") ?? "").trim(),
        addressLine1: String(formData.get("addressLine1") ?? "").trim(),
        addressLine2: String(formData.get("addressLine2") ?? "").trim(),
        townCity: String(formData.get("townCity") ?? "").trim(),
        countyState: String(formData.get("countyState") ?? "").trim(),
        postcodeZip: String(formData.get("postcodeZip") ?? "").trim(),
        country: String(formData.get("country") ?? "").trim(),
        billingRate: String(formData.get("billingRate") ?? "").trim(),
    };
}

/** Returns an error message, or the normalised fields ready for Prisma. */
export function validateCompanyFields(
    fields: CompanyFormFields,
): { error: string } | { data: ParsedCompanyFields } {
    if (!fields.name) return { error: "Company name is required" };
    if (fields.name.length > ADDRESS_MAX)
        return { error: `Company name must be ${ADDRESS_MAX} characters or less` };

    for (const [value, label] of [
        [fields.addressLine1, "Address Line 1"],
        [fields.addressLine2, "Address Line 2"],
        [fields.townCity, "Town/City"],
        [fields.countyState, "County/State"],
    ] as const) {
        const error = optionalText(value, ADDRESS_MAX, label);
        if (error) return { error };
    }

    const postcodeError = optionalText(
        fields.postcodeZip,
        POSTCODE_MAX,
        "Postcode/Zip",
    );
    if (postcodeError) return { error: postcodeError };

    if (fields.country && !isCountry(fields.country))
        return { error: "Select a valid country" };

    if (!fields.billingRate) return { error: "Billing rate is required" };

    if (!isValidBillingRate(fields.billingRate))
        return {
            error: "Billing rate must be a number with up to 2 decimal places",
        };

    const rate = Number(fields.billingRate);
    if (!Number.isFinite(rate) || rate < 0)
        return { error: "Billing rate must be zero or greater" };
    if (rate > BILLING_RATE_MAX)
        return { error: `Billing rate must be ${BILLING_RATE_MAX} or less` };

    return {
        data: {
            name: fields.name,
            addressLine1: fields.addressLine1 || null,
            addressLine2: fields.addressLine2 || null,
            townCity: fields.townCity || null,
            countyState: fields.countyState || null,
            postcodeZip: fields.postcodeZip || null,
            country: fields.country || null,
            billingRate: fields.billingRate,
        },
    };
}

export function isValidBillingRate(value: string): boolean {
    return /^\d+(\.\d{1,2})?$/.test(value.trim());
}

export function formatBillingRate(value: string | number): string {
    const amount = typeof value === "number" ? value : Number(value);
    if (!Number.isFinite(amount)) return value.toString();
    return amount.toLocaleString("en-GB", {
        style: "currency",
        currency: "GBP",
    });
}
