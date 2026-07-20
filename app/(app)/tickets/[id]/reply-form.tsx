"use client";

import { useActionState, useEffect, useRef } from "react";
import { addMessage, type AddMessageState } from "../actions";

const MAX_MESSAGE = 5000;

export function ReplyForm({ ticketId }: { ticketId: string }) {
    const formRef = useRef<HTMLFormElement>(null);
    const [state, formAction, pending] = useActionState<
        AddMessageState | null,
        FormData
    >(addMessage, null);

    useEffect(() => {
        if (state?.success) formRef.current?.reset();
    }, [state]);

    return (
        <form ref={formRef} action={formAction} className="grid gap-2">
            <input type="hidden" name="ticketId" value={ticketId} />
            <textarea
                name="content"
                required
                rows={3}
                maxLength={MAX_MESSAGE}
                placeholder="Write a reply..."
                disabled={pending}
                className="w-full rounded-md border border-zinc-300 p-2"
            />

            {state?.error && (
                <p className="text-sm text-red-600">{state.error}</p>
            )}

            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={pending}
                    className="cursor-pointer rounded-md bg-[#ee6b5d] px-4 py-2 text-sm font-medium text-white hover:bg-[#e55a4c] disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {pending ? "Sending..." : "Send Reply"}
                </button>
            </div>
        </form>
    );
}
