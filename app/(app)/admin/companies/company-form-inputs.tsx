"use client";

import { COUNTRIES } from "./countries";
import type { ReactNode } from "react";

export type CompanyAddressValues = {
    addressLine1: string;
    addressLine2: string;
    townCity: string;
    countyState: string;
    postcodeZip: string;
    country: string;
};

type CompanyFormInputsProps = {
    disabled?: boolean;
    name: {
        value: string;
        onChange: (value: string) => void;
    };
    billingRate: {
        value: string;
        onChange: (value: string) => void;
    };
    address: {
        values: CompanyAddressValues;
        onChange: (field: keyof CompanyAddressValues, value: string) => void;
    };
};

const inputClass =
    "w-full rounded-md border border-zinc-200 bg-[#f5f5f5] px-3 py-2.5 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-300 focus:bg-white";

const labelClass = "mb-1.5 block text-sm font-semibold text-zinc-800";

function FieldLabel({
    htmlFor,
    children,
    required = false,
}: {
    htmlFor: string;
    children: ReactNode;
    required?: boolean;
}) {
    return (
        <label htmlFor={htmlFor} className={labelClass}>
            {children}
            {required ? <span className="text-[#ee6b5d]"> *</span> : null}
        </label>
    );
}

export function CompanyFormInputs({
    disabled = false,
    name,
    billingRate,
    address,
}: CompanyFormInputsProps) {
    return (
        <div className="grid gap-4">
            <div>
                <FieldLabel htmlFor="company-name" required>
                    Company Name
                </FieldLabel>
                <input
                    id="company-name"
                    type="text"
                    name="name"
                    value={name.value}
                    onChange={(event) => name.onChange(event.target.value)}
                    required
                    maxLength={100}
                    disabled={disabled}
                    className={inputClass}
                />
            </div>

            <div>
                <FieldLabel htmlFor="address-line-1">Address Line 1</FieldLabel>
                <input
                    id="address-line-1"
                    type="text"
                    name="addressLine1"
                    value={address.values.addressLine1}
                    onChange={(event) =>
                        address.onChange("addressLine1", event.target.value)
                    }
                    maxLength={100}
                    disabled={disabled}
                    className={inputClass}
                />
            </div>

            <div>
                <FieldLabel htmlFor="address-line-2">Address Line 2</FieldLabel>
                <input
                    id="address-line-2"
                    type="text"
                    name="addressLine2"
                    value={address.values.addressLine2}
                    onChange={(event) =>
                        address.onChange("addressLine2", event.target.value)
                    }
                    maxLength={100}
                    disabled={disabled}
                    className={inputClass}
                />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div>
                    <FieldLabel htmlFor="town-city">Town/City</FieldLabel>
                    <input
                        id="town-city"
                        type="text"
                        name="townCity"
                        value={address.values.townCity}
                        onChange={(event) =>
                            address.onChange("townCity", event.target.value)
                        }
                        maxLength={100}
                        disabled={disabled}
                        className={inputClass}
                    />
                </div>
                <div>
                    <FieldLabel htmlFor="county-state">County/State</FieldLabel>
                    <input
                        id="county-state"
                        type="text"
                        name="countyState"
                        value={address.values.countyState}
                        onChange={(event) =>
                            address.onChange("countyState", event.target.value)
                        }
                        maxLength={100}
                        disabled={disabled}
                        className={inputClass}
                    />
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div>
                    <FieldLabel htmlFor="postcode-zip">Postcode/Zip</FieldLabel>
                    <input
                        id="postcode-zip"
                        type="text"
                        name="postcodeZip"
                        value={address.values.postcodeZip}
                        onChange={(event) =>
                            address.onChange("postcodeZip", event.target.value)
                        }
                        maxLength={20}
                        disabled={disabled}
                        className={inputClass}
                    />
                </div>
                <div>
                    <FieldLabel htmlFor="country">Country</FieldLabel>
                    <select
                        id="country"
                        name="country"
                        value={address.values.country}
                        onChange={(event) =>
                            address.onChange("country", event.target.value)
                        }
                        disabled={disabled}
                        className={`${inputClass} appearance-none bg-[length:1rem] bg-[right_0.75rem_center] bg-no-repeat pr-9`}
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2371717a' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                        }}
                    >
                        <option value="">Select a country</option>
                        {COUNTRIES.map((country) => (
                            <option key={country} value={country}>
                                {country}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div>
                <FieldLabel htmlFor="billing-rate" required>
                    Billing Rate (£)
                </FieldLabel>
                <input
                    id="billing-rate"
                    type="text"
                    name="billingRate"
                    inputMode="decimal"
                    value={billingRate.value}
                    onChange={(event) =>
                        billingRate.onChange(event.target.value)
                    }
                    placeholder="90.00"
                    required
                    disabled={disabled}
                    className={inputClass}
                />
            </div>
        </div>
    );
}
