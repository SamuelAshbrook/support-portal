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
        `Opened by: ${opener} (${ticket.companyName})`,
        `Type: ${ticket.type}`,
        `Priority: ${ticket.priority}`,
        ``,
        `Description:`,
        excerpt,
        ``,
        `View ticket: ${url}`,
    ].join("\n");

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; line-height: 1.5; color: #18181b; max-width: 560px;">
        <p style="margin: 0 0 20px;">A new support ticket was created.</p>
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse; border: 1px solid #e4e4e7; border-radius: 8px; overflow: hidden;">
          <tr>
            <td style="padding: 10px 14px; width: 112px; background: #fafafa; border-bottom: 1px solid #e4e4e7; color: #71717a; font-size: 13px; font-weight: 600;">Ticket</td>
            <td style="padding: 10px 14px; border-bottom: 1px solid #e4e4e7;">#${ticket.ticketNumber} — ${escapeHtml(ticket.title)}</td>
          </tr>
          <tr>
            <td style="padding: 10px 14px; background: #fafafa; border-bottom: 1px solid #e4e4e7; color: #71717a; font-size: 13px; font-weight: 600;">Opened by</td>
            <td style="padding: 10px 14px; border-bottom: 1px solid #e4e4e7;">${escapeHtml(opener)} <span style="color: #71717a;">(${escapeHtml(ticket.companyName)})</span></td>
          </tr>
          <tr>
            <td style="padding: 10px 14px; background: #fafafa; border-bottom: 1px solid #e4e4e7; color: #71717a; font-size: 13px; font-weight: 600;">Type</td>
            <td style="padding: 10px 14px; border-bottom: 1px solid #e4e4e7;">${escapeHtml(ticket.type)}</td>
          </tr>
          <tr>
            <td style="padding: 10px 14px; background: #fafafa; color: #71717a; font-size: 13px; font-weight: 600;">Priority</td>
            <td style="padding: 10px 14px;">${escapeHtml(ticket.priority)}</td>
          </tr>
        </table>
        <p style="margin: 20px 0 6px; color: #71717a; font-size: 13px; font-weight: 600;">Description</p>
        <p style="margin: 0 0 24px; white-space: pre-wrap;">${escapeHtml(excerpt)}</p>
        <a href="${escapeHtml(url)}" style="display: inline-block; background: #2d3252; color: #ffffff; text-decoration: none; padding: 10px 16px; border-radius: 6px; font-size: 14px; font-weight: 600;">View ticket</a>
      </div>
    `.trim();

    await sendEmail({ to, subject, text, html });
}
