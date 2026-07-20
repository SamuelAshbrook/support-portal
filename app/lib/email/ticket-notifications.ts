import { formatExcerpt } from "@/app/lib/format-excerpt";
import {
    getSupportInboxEmail,
    sendEmail,
    ticketUrl,
} from "@/app/lib/email/resend";
import { getTicketStatusDisplay } from "@/app/lib/ticket-status";
import type { TicketStatus } from "@/app/generated/prisma/client";

export type NewTicketNotificationInput = {
    id: string;
    ticketNumber: number;
    title: string;
    description: string;
    type: string;
    priority: string;
    companyName: string;
    createdByName: string | null;
    createdByEmail: string;
};

export type NewMessageNotificationInput = {
    ticketId: string;
    ticketNumber: number;
    ticketTitle: string;
    companyName: string;
    createdByEmail: string;
    senderRole: "ADMIN" | "CLIENT";
    senderName: string | null;
    senderEmail: string;
    content: string;
};

export type StatusChangedNotificationInput = {
    ticketId: string;
    ticketNumber: number;
    ticketTitle: string;
    companyName: string;
    createdByEmail: string;
    previousStatus: string;
    newStatus: string;
};

function escapeHtml(value: string): string {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;");
}

function metaRow(label: string, valueHtml: string, isLast = false): string {
    const border = isLast ? "" : "border-bottom: 1px solid #e4e4e7;";
    return `
      <tr>
        <td style="padding: 10px 14px; width: 112px; background: #fafafa; ${border} color: #71717a; font-size: 13px; font-weight: 600;">${escapeHtml(label)}</td>
        <td style="padding: 10px 14px; ${border}">${valueHtml}</td>
      </tr>
    `.trim();
}

function emailLayout(options: {
    intro: string;
    rows: { label: string; valueHtml: string }[];
    sectionLabel: string;
    sectionBody: string;
    url: string;
}): string {
    const rowsHtml = options.rows
        .map((row, index) =>
            metaRow(row.label, row.valueHtml, index === options.rows.length - 1),
        )
        .join("");

    return `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; line-height: 1.5; color: #18181b; max-width: 560px;">
        <p style="margin: 0 0 20px;">${escapeHtml(options.intro)}</p>
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse; border: 1px solid #e4e4e7; border-radius: 8px; overflow: hidden;">
          ${rowsHtml}
        </table>
        <p style="margin: 20px 0 6px; color: #71717a; font-size: 13px; font-weight: 600;">${escapeHtml(options.sectionLabel)}</p>
        <p style="margin: 0 0 24px; white-space: pre-wrap;">${escapeHtml(options.sectionBody)}</p>
        <a href="${escapeHtml(options.url)}" style="display: inline-block; background: #2d3252; color: #ffffff; text-decoration: none; padding: 10px 16px; border-radius: 6px; font-size: 14px; font-weight: 600;">View ticket</a>
      </div>
    `.trim();
}

/**
 * Emails the shared support inbox when a client opens a new ticket.
 */
export async function notifyAdminsNewTicket(
    ticket: NewTicketNotificationInput,
): Promise<void> {
    const to = getSupportInboxEmail();
    if (!to) {
        console.warn(
            "[email] Skipping new-ticket notification — SUPPORT_INBOX_EMAIL is not set",
        );
        return;
    }

    const url = ticketUrl(ticket.id);
    const opener = ticket.createdByName ?? ticket.createdByEmail;
    const excerpt = formatExcerpt(ticket.description, 40);
    const subject = `[Ticket #${ticket.ticketNumber}] New ticket: ${ticket.title}`;

    const text = [
        `A new support ticket was created.`,
        ``,
        `Ticket: #${ticket.ticketNumber} — ${ticket.title}`,
        `Opened by: ${opener} (${ticket.companyName})`,
        `Type: ${ticket.type}`,
        `Priority: ${ticket.priority}`,
        ``,
        `Description:`,
        excerpt,
        ``,
        `View ticket: ${url}`,
    ].join("\n");

    const html = emailLayout({
        intro: "A new support ticket was created.",
        rows: [
            {
                label: "Ticket",
                valueHtml: `#${ticket.ticketNumber} — ${escapeHtml(ticket.title)}`,
            },
            {
                label: "Opened by",
                valueHtml: `${escapeHtml(opener)} <span style="color: #71717a;">(${escapeHtml(ticket.companyName)})</span>`,
            },
            { label: "Type", valueHtml: escapeHtml(ticket.type) },
            { label: "Priority", valueHtml: escapeHtml(ticket.priority) },
        ],
        sectionLabel: "Description",
        sectionBody: excerpt,
        url,
    });

    await sendEmail({ to, subject, text, html });
}

/**
 * Emails the other party when a message is added to a ticket.
 * Client messages go to the shared support inbox; admin messages go to the ticket author.
 */
export async function notifyNewMessage(
    input: NewMessageNotificationInput,
): Promise<void> {
    const to =
        input.senderRole === "ADMIN"
            ? input.createdByEmail.trim() || null
            : getSupportInboxEmail();

    if (!to) {
        console.warn(
            "[email] Skipping new-message notification — no recipient available",
        );
        return;
    }

    const url = ticketUrl(input.ticketId);
    const sender = input.senderName ?? input.senderEmail;
    const excerpt = formatExcerpt(input.content, 40);
    const intro =
        input.senderRole === "ADMIN"
            ? "Support replied to your ticket."
            : "A new message was added to a ticket.";
    const subject = `[Ticket #${input.ticketNumber}] New reply: ${input.ticketTitle}`;

    const text = [
        intro,
        ``,
        `Ticket: #${input.ticketNumber} — ${input.ticketTitle}`,
        `Company: ${input.companyName}`,
        `From: ${sender}`,
        ``,
        `Message:`,
        excerpt,
        ``,
        `View ticket: ${url}`,
    ].join("\n");

    const html = emailLayout({
        intro,
        rows: [
            {
                label: "Ticket",
                valueHtml: `#${input.ticketNumber} — ${escapeHtml(input.ticketTitle)}`,
            },
            {
                label: "Company",
                valueHtml: escapeHtml(input.companyName),
            },
            {
                label: "From",
                valueHtml: escapeHtml(sender),
            },
        ],
        sectionLabel: "Message",
        sectionBody: excerpt,
        url,
    });

    await sendEmail({ to, subject, text, html });
}

/**
 * Emails the ticket author when an admin changes the ticket status.
 */
export async function notifyTicketStatusChanged(
    input: StatusChangedNotificationInput,
): Promise<void> {
    const to = input.createdByEmail.trim() || null;
    if (!to) {
        console.warn(
            "[email] Skipping status-change notification — no recipient available",
        );
        return;
    }

    const url = ticketUrl(input.ticketId);
    const previousLabel = getTicketStatusDisplay(
        input.previousStatus as TicketStatus,
    ).label;
    const newLabel = getTicketStatusDisplay(
        input.newStatus as TicketStatus,
    ).label;
    const intro = `The status of your ticket was updated to ${newLabel}.`;
    const subject = `[Ticket #${input.ticketNumber}] Status updated: ${input.ticketTitle}`;

    const text = [
        intro,
        ``,
        `Ticket: #${input.ticketNumber} — ${input.ticketTitle}`,
        `Company: ${input.companyName}`,
        `Previous status: ${previousLabel}`,
        `New status: ${newLabel}`,
        ``,
        `View ticket: ${url}`,
    ].join("\n");

    const html = emailLayout({
        intro,
        rows: [
            {
                label: "Ticket",
                valueHtml: `#${input.ticketNumber} — ${escapeHtml(input.ticketTitle)}`,
            },
            {
                label: "Company",
                valueHtml: escapeHtml(input.companyName),
            },
            {
                label: "Previous",
                valueHtml: escapeHtml(previousLabel),
            },
            {
                label: "New status",
                valueHtml: escapeHtml(newLabel),
            },
        ],
        sectionLabel: "Update",
        sectionBody: `Changed from ${previousLabel} to ${newLabel}.`,
        url,
    });

    await sendEmail({ to, subject, text, html });
}
