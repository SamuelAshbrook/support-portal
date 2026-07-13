"use client";

import { Plus } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { CreateCompanyForm } from "./create-company-form";

export function AddCompanyButton() {
    const [open, setOpen] = useState(false);
    const dialogRef = useRef<HTMLDialogElement>(null);
    const titleId = useId();

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        if (open && !dialog.open) dialog.showModal();
        if (!open && dialog.open) dialog.close();
    }, [open]);

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-md bg-[#ee6b5d] px-3.5 py-2 text-sm font-medium text-white hover:bg-[#e55a4c]"
            >
                <Plus className="size-4" strokeWidth={2.5} aria-hidden />
                Add Company
            </button>

            <dialog
                ref={dialogRef}
                aria-labelledby={titleId}
                onClose={() => setOpen(false)}
                onClick={(event) => {
                    if (event.target === dialogRef.current) setOpen(false);
                }}
                className="m-auto w-[min(100%,28rem)] rounded-lg border border-zinc-200 bg-white p-0 shadow-lg backdrop:bg-black/40"
            >
                <div className="space-y-4 p-6">
                    <div className="flex items-center justify-between gap-4">
                        <h2 id={titleId} className="text-lg font-semibold text-zinc-900">
                            Add Company
                        </h2>
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            className="text-sm text-zinc-500 hover:text-zinc-800"
                        >
                            Close
                        </button>
                    </div>
                    <CreateCompanyForm
                        onSuccess={() => setOpen(false)}
                    />
                </div>
            </dialog>
        </>
    );
}
