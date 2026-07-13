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
    createClientUser,
    updateUser,
    type UserActionState,
} from "./actions";
import { validatePassword } from "./password";
import {
    UserFormInputs,
    type CompanyOption,
} from "./user-form-inputs";
import { useUserEmailCheck } from "./use-user-email-check";

export type UserFormInitialValues = {
    id: string;
    name: string;
    email: string;
    telephone: string;
    companyId: string;
};

const emptySubscribe = () => () => {};

function useIsClient() {
    return useSyncExternalStore(emptySubscribe, () => true, () => false);
}

type UserFormDialogProps = {
    open: boolean;
    onClose: () => void;
    mode: "create" | "edit";
    companies: CompanyOption[];
    initial?: UserFormInitialValues;
};

export function UserFormDialog({
    open,
    onClose,
    mode,
    companies,
    initial,
}: UserFormDialogProps) {
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
            <UserFormDialogContent
                key={formKey}
                titleId={titleId}
                mode={mode}
                companies={companies}
                initial={initial}
                onClose={onClose}
            />
        </dialog>,
        document.body,
    );
}

function UserFormDialogContent({
    titleId,
    mode,
    companies,
    initial,
    onClose,
}: {
    titleId: string;
    mode: "create" | "edit";
    companies: CompanyOption[];
    initial?: UserFormInitialValues;
    onClose: () => void;
}) {
    const isEdit = mode === "edit";
    const [name, setName] = useState(initial?.name ?? "");
    const [telephone, setTelephone] = useState(initial?.telephone ?? "");
    const [companyId, setCompanyId] = useState(initial?.companyId ?? "");
    const [password, setPassword] = useState("");
    const { email, emailExists, checkingEmail, handleEmailChange } =
        useUserEmailCheck({
            initialEmail: initial?.email ?? "",
            excludeUserId: initial?.id,
            enabled: true,
        });

    async function submitForm(
        prevState: UserActionState | null,
        formData: FormData,
    ): Promise<UserActionState> {
        const result = isEdit
            ? await updateUser(prevState, formData)
            : await createClientUser(prevState, formData);
        if (result.success) onClose();
        return result;
    }

    const [state, formAction, pending] = useActionState<
        UserActionState | null,
        FormData
    >(submitForm, null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedTelephone = telephone.trim();
    const showDuplicateMessage =
        trimmedEmail.length > 0 && !checkingEmail && emailExists;
    const passwordError =
        !isEdit && password.length > 0 ? validatePassword(password) : null;

    const unchanged =
        isEdit &&
        trimmedName === (initial?.name ?? "").trim() &&
        trimmedEmail.toLowerCase() ===
            (initial?.email ?? "").trim().toLowerCase() &&
        trimmedTelephone === (initial?.telephone ?? "").trim() &&
        companyId === (initial?.companyId ?? "");

    const canSubmit =
        trimmedName.length > 0 &&
        trimmedEmail.length > 0 &&
        trimmedTelephone.length > 0 &&
        companyId.length > 0 &&
        !emailExists &&
        !checkingEmail &&
        !pending &&
        !unchanged &&
        (isEdit || (password.length > 0 && passwordError === null));

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
                        {isEdit ? "Edit User" : "Add New User"}
                    </h2>
                    <p className="mt-1 text-sm text-zinc-500">
                        {isEdit
                            ? "Update this user record"
                            : "Create a new client user"}
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

            <UserFormInputs
                disabled={pending}
                showPassword={!isEdit}
                name={{ value: name, onChange: setName }}
                email={{ value: email, onChange: handleEmailChange }}
                telephone={{ value: telephone, onChange: setTelephone }}
                password={
                    isEdit
                        ? undefined
                        : { value: password, onChange: setPassword }
                }
                companyId={{ value: companyId, onChange: setCompanyId }}
                companies={companies}
            />

            {(showDuplicateMessage || passwordError || state?.error) && (
                <div className="mt-4 space-y-1">
                    {showDuplicateMessage && (
                        <p className="text-sm text-red-600">
                            User already exists
                        </p>
                    )}
                    {passwordError && (
                        <p className="text-sm text-red-600">{passwordError}</p>
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
                          ? "Update User"
                          : "Add User"}
                </button>
            </div>
        </form>
    );
}
