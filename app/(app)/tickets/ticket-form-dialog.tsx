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
import { createTicket, type CreateTicketState } from "./actions";

const emptySubscribe = () => () => {};

function useIsClient() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}

type TicketFormDialogProps = {
  open: boolean;
  onClose: () => void;
};

export function TicketFormDialog({ open, onClose }: TicketFormDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
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
      <TicketFormDialogContent titleId={titleId} onClose={onClose} />
    </dialog>,
    document.body,
  );
}

function TicketFormDialogContent({
  titleId,
  onClose,
}: {
  titleId: string;
  onClose: () => void;
}) {
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("FIX_PROBLEM");
  const [priority, setPriority] = useState("MEDIUM");

  async function submitForm(
    prevState: CreateTicketState | null,
    formData: FormData,
  ): Promise<CreateTicketState> {
    const result = await createTicket(prevState, formData);
    if (result.success) onClose();
    return result;
  }

  const [state, formAction, pending] = useActionState<
    CreateTicketState | null,
    FormData
  >(submitForm, null);

  const trimmedSubject = subject.trim();
  const subjectValid =
    trimmedSubject.length >= 3 && trimmedSubject.length <= 255;
  const descriptionValid = description.length <= 10000;
  const canSubmit =
    subjectValid && descriptionValid && !pending;

  const fieldClass =
    "w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-1 focus:ring-zinc-300 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:opacity-60";

  return (
    <form action={formAction} className="p-6 sm:p-7">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 id={titleId} className="text-xl font-bold text-zinc-800">
            Create New Ticket
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Fill in the details to create a new support ticket
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

      <div className="space-y-4">
        <div className="grid gap-1.5">
          <label htmlFor="ticket-subject" className="text-sm font-medium text-zinc-800">
            Subject <span className="text-red-500">*</span>
          </label>
          <input
            id="ticket-subject"
            name="title"
            type="text"
            required
            minLength={3}
            maxLength={255}
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            placeholder="Brief description of the issue"
            className={fieldClass}
            disabled={pending}
          />
          <p className="text-xs text-zinc-400">3-255 characters</p>
        </div>

        <div className="grid gap-1.5">
          <label
            htmlFor="ticket-description"
            className="text-sm font-medium text-zinc-800"
          >
            Description
          </label>
          <textarea
            id="ticket-description"
            name="description"
            maxLength={10000}
            rows={5}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Detailed description of the issue (optional)"
            className={`${fieldClass} resize-y`}
            disabled={pending}
          />
          <p className="text-xs text-zinc-400">Maximum 10,000 characters</p>
        </div>

        <div className="grid gap-1.5">
          <label htmlFor="ticket-type" className="text-sm font-medium text-zinc-800">
            Type
          </label>
          <select
            id="ticket-type"
            name="type"
            required
            value={type}
            onChange={(event) => setType(event.target.value)}
            className={fieldClass}
            disabled={pending}
          >
            <option value="FIX_PROBLEM">Fix a problem</option>
            <option value="ASK_QUESTION">Ask a question</option>
            <option value="UPDATE_OR_ADD">Update or add something</option>
            <option value="BILLING">Billing</option>
          </select>
        </div>

        <div className="grid gap-1.5">
          <label
            htmlFor="ticket-priority"
            className="text-sm font-medium text-zinc-800"
          >
            Priority
          </label>
          <select
            id="ticket-priority"
            name="priority"
            required
            value={priority}
            onChange={(event) => setPriority(event.target.value)}
            className={fieldClass}
            disabled={pending}
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Normal</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>
      </div>

      {state?.error ? (
        <p className="mt-4 text-sm text-red-600">{state.error}</p>
      ) : null}

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
          {pending ? "Creating..." : "Create Ticket"}
        </button>
      </div>
    </form>
  );
}
