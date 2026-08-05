import {
  TicketPriority,
  TicketType,
} from "@/app/generated/prisma/enums";

export const MAX_TITLE = 200;
export const MAX_DESCRIPTION = 5000;

export type CreateTicketFields = {
  title: string;
  description: string;
  type: string;
  priority: string;
};

export type ParsedCreateTicketFields = {
  title: string;
  description: string;
  type: TicketType;
  priority: TicketPriority;
};

/** Returns an error message, or normalised fields ready for Prisma. */
export function validateCreateTicketFields(
  fields: CreateTicketFields,
): { error: string } | { data: ParsedCreateTicketFields } {
  const title = fields.title.trim();
  const description = fields.description.trim();

  if (!title) return { error: "Title is required" };
  if (!description) return { error: "Description is required" };
  if (title.length > MAX_TITLE)
    return { error: `Title must be ${MAX_TITLE} characters or less` };
  if (description.length > MAX_DESCRIPTION)
    return { error: `Description must be ${MAX_DESCRIPTION} characters or less` };

  if (!Object.values(TicketType).includes(fields.type as TicketType))
    return { error: "Invalid ticket type" };

  if (!Object.values(TicketPriority).includes(fields.priority as TicketPriority))
    return { error: "Invalid ticket priority" };

  return {
    data: {
      title,
      description,
      type: fields.type as TicketType,
      priority: fields.priority as TicketPriority,
    },
  };
}
