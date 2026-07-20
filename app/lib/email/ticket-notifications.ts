import { formatExcerpt } from "@/app/lib/format-excerpt";
import {
    getSupportInboxEmail,
    sendEmail,
    ticketUrl,
} from "@/app/lib/email/resend";

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

function escapeHtml(value: string): string {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;");
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
        `Company: ${ticket.companyName}`,
        `Opened by: ${opener}`,
        `Type: ${ticket.type}`,
        `Priority: ${ticket.priority}`,
        ``,
        `Description:`,
        excerpt,
        ``,
        `View ticket: ${url}`,
    ].join("\n");

    const html = `
        <p>A new support ticket was created.</p>
        <p></p>
        <p><strong>Ticket:</strong> #${ticket.ticketNumber} — ${escapeHtml(ticket.title)}</p>
        <p><strong>Opened by:</strong> ${escapeHtml(opener)} (${escapeHtml(ticket.companyName)})</p>
        <p><strong>Type:</strong> ${escapeHtml(ticket.type)}</p>
        <p><strong>Priority:</strong> ${escapeHtml(ticket.priority)}</p>
        <p></p>
        <p><strong>Description:</strong></p>
        <p>${escapeHtml(excerpt)}</p>
        <p><a href="${escapeHtml(url)}">View ticket</a></p>
    `.trim();

    await sendEmail({ to, subject, text, html });
}
