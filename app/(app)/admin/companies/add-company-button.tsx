"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { CompanyFormDialog } from "./company-form-dialog";

export function AddCompanyButton() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-md bg-[#ee6b5d] px-3.5 py-2 text-sm font-medium text-white hover:bg-[#e55a4c]"
            >
                <Plus className="size-4" strokeWidth={2.5} aria-hidden />
                Add Company
            </button>

            <CompanyFormDialog
                open={open}
                onClose={() => setOpen(false)}
                mode="create"
            />
        </>
    );
}
