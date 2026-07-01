"use client";

import { useActionState } from "react";
import { createTicket, type CreateTicketState } from "./actions";

export function CreateTicketForm() {
    const [state, formAction, pending] = useActionState<
    CreateTicketState | null,
    FormData
    >(createTicket, null);

    return (
        <form action={formAction} className="grid max-w-md gap-2">
            {state?.error && (
                <p className="rounded-md border border-red-200 bg-red-50 px-3 p-2 text-sm text-red-700">
                    {state.error}
                </p>
            )}

            {state?.success && (
                <p className="rounded-md border border-green-200 bg-green-50 px-3 p-2 text-sm text-green-700">
                    Ticket created successfully
                </p>
            )}

            <div className="grid gap-1">
                <label htmlFor="title" className="text-sm font-medium">
                    Title<span className="text-red-500">*</span>
                </label>
                <input
                    id="title"
                    name="title"
                    type="text"
                    required
                    maxLength={200}
                    placeholder="Brief description of the issue"
                    className="w-full rounded-md border border-zinc-300 p-2"
                    disabled={pending}
                />
            </div>

            <div className="grid gap-1">
                <label htmlFor="description" className="text-sm font-medium">
                    Description<span className="text-red-500">*</span>
                </label>
                <textarea
                    id="description"
                    name="description"
                    required
                    maxLength={5000}
                    rows={4}
                    placeholder="Detailed description of the issue"
                    className="w-full rounded-md border border-zinc-300 p-2"
                    disabled={pending}
                />
            </div>

            <input type="file" name="attachments" multiple accept="image/jpeg,image/png,image/webp" />

            <select name="type" required defaultValue="FIX_PROBLEM">
                <option value="FIX_PROBLEM">Fix a problem</option>
                <option value="ASK_QUESTION">Ask a question</option>
                <option value="UPDATE_OR_ADD">Update or add something</option>
                <option value="BILLING">Billing</option>
            </select>

            <select name="priority" required defaultValue="MEDIUM">
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
            </select>

            <button
                type="submit"
                disabled={pending}
                className="w-full rounded-md bg-blue-500 text-white p-2 disabled:opacity-50"
            >
                {pending ? "Creating..." : "Create Ticket"}
            </button>
        </form>
    );
}