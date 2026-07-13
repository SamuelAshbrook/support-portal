"use client";

import type { ReactNode } from "react";
import { PASSWORD_MAX } from "./password";

export type CompanyOption = {
    id: string;
    name: string;
};

type UserFormInputsProps = {
    disabled?: boolean;
    showPassword?: boolean;
    name: {
        value: string;
        onChange: (value: string) => void;
    };
    email: {
        value: string;
        onChange: (value: string) => void;
    };
    telephone: {
        value: string;
        onChange: (value: string) => void;
    };
    password?: {
        value: string;
        onChange: (value: string) => void;
    };
    companyId: {
        value: string;
        onChange: (value: string) => void;
    };
    companies: CompanyOption[];
};

const inputClass =
    "w-full rounded-md border border-zinc-200 bg-[#f5f5f5] px-3 py-2.5 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-300 focus:bg-white";

const labelClass = "mb-1.5 block text-sm font-semibold text-zinc-800";

const selectClass = `${inputClass} appearance-none bg-[length:1rem] bg-[right_0.75rem_center] bg-no-repeat pr-9 cursor-pointer`;

const selectChevron = {
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2371717a' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
};

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

export function UserFormInputs({
    disabled = false,
    showPassword = false,
    name,
    email,
    telephone,
    password,
    companyId,
    companies,
}: UserFormInputsProps) {
    return (
        <div className="grid gap-4">
            <div>
                <FieldLabel htmlFor="user-name" required>
                    Name
                </FieldLabel>
                <input
                    id="user-name"
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
                <FieldLabel htmlFor="user-email" required>
                    Email
                </FieldLabel>
                <input
                    id="user-email"
                    type="email"
                    name="email"
                    value={email.value}
                    onChange={(event) => email.onChange(event.target.value)}
                    required
                    disabled={disabled}
                    className={inputClass}
                />
            </div>

            <div>
                <FieldLabel htmlFor="user-telephone" required>
                    Phone
                </FieldLabel>
                <input
                    id="user-telephone"
                    type="tel"
                    name="telephone"
                    value={telephone.value}
                    onChange={(event) => telephone.onChange(event.target.value)}
                    required
                    disabled={disabled}
                    className={inputClass}
                />
            </div>

            {showPassword && password ? (
                <div>
                    <FieldLabel htmlFor="user-password" required>
                        Temp Password
                    </FieldLabel>
                    <input
                        id="user-password"
                        type="password"
                        name="password"
                        value={password.value}
                        onChange={(event) =>
                            password.onChange(event.target.value)
                        }
                        required
                        maxLength={PASSWORD_MAX}
                        disabled={disabled}
                        className={inputClass}
                    />
                    <p className="mt-1.5 text-xs text-zinc-500">
                        Min 8 characters, at least 1 number and 1 symbol.
                    </p>
                </div>
            ) : null}

            <div>
                <FieldLabel htmlFor="user-company" required>
                    Company
                </FieldLabel>
                <select
                    id="user-company"
                    name="companyId"
                    value={companyId.value}
                    onChange={(event) =>
                        companyId.onChange(event.target.value)
                    }
                    required
                    disabled={disabled}
                    className={selectClass}
                    style={selectChevron}
                >
                    <option value="">Select a company</option>
                    {companies.map((company) => (
                        <option key={company.id} value={company.id}>
                            {company.name}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}
