"use client";

import { COUNTRIES } from "./countries";

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

const inputClass = "w-full rounded-md border border-zinc-300 p-2";

export function CompanyFormInputs({
    disabled = false,
    name,
    billingRate,
    address,
}: CompanyFormInputsProps) {
    return (
        <div className="grid max-w-md gap-2">
            <input
                type="text"
                name="name"
                value={name.value}
                onChange={(event) => name.onChange(event.target.value)}
                placeholder="Company Name"
                required
                maxLength={100}
                disabled={disabled}
                className={inputClass}
            />
            <input
                type="text"
                name="addressLine1"
                value={address.values.addressLine1}
                onChange={(event) =>
                    address.onChange("addressLine1", event.target.value)
                }
                placeholder="Address Line 1"
                maxLength={100}
                disabled={disabled}
                className={inputClass}
            />
            <input
                type="text"
                name="addressLine2"
                value={address.values.addressLine2}
                onChange={(event) =>
                    address.onChange("addressLine2", event.target.value)
                }
                placeholder="Address Line 2"
                maxLength={100}
                disabled={disabled}
                className={inputClass}
            />
            <input
                type="text"
                name="townCity"
                value={address.values.townCity}
                onChange={(event) =>
                    address.onChange("townCity", event.target.value)
                }
                placeholder="Town/City"
                maxLength={100}
                disabled={disabled}
                className={inputClass}
            />
            <input
                type="text"
                name="countyState"
                value={address.values.countyState}
                onChange={(event) =>
                    address.onChange("countyState", event.target.value)
                }
                placeholder="County/State"
                maxLength={100}
                disabled={disabled}
                className={inputClass}
            />
            <input
                type="text"
                name="postcodeZip"
                value={address.values.postcodeZip}
                onChange={(event) =>
                    address.onChange("postcodeZip", event.target.value)
                }
                placeholder="Postcode/Zip"
                maxLength={20}
                disabled={disabled}
                className={inputClass}
            />
            <select
                name="country"
                value={address.values.country}
                onChange={(event) =>
                    address.onChange("country", event.target.value)
                }
                disabled={disabled}
                className={inputClass}
            >
                <option value="">Country</option>
                {COUNTRIES.map((country) => (
                    <option key={country} value={country}>
                        {country}
                    </option>
                ))}
            </select>
            <input
                type="text"
                name="billingRate"
                inputMode="decimal"
                value={billingRate.value}
                onChange={(event) => billingRate.onChange(event.target.value)}
                placeholder="Billing Rate (£)"
                required
                disabled={disabled}
                className={inputClass}
            />
        </div>
    );
}
