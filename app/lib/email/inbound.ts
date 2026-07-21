import prisma from "@/app/lib/prisma";
import {
    getInboundDomain,
    getResendClient,
    getSupportInboxEmail,
} from "@/app/lib/email/resend";
import { notifyNewMessage } from "@/app/lib/email/ticket-notifications";

const MAX_MESSAGE = 5000;

const NOISE_FROM =
    /(mailer-daemon|postmaster|no-?reply|noreply|bounce)/i;

export function parseEmailAddress(raw: string): string {
    const trimmed = raw.trim();
    const angle = trimmed.match(/<([^>]+)>/);
    return (angle?.[1] ?? trimmed).trim().toLowerCase();
}

/**
 * Extracts ticket id from addresses like ticket+{id}@reply.example.com
 */
export function parseTicketIdFromRecipients(
    recipients: string[],
    inboundDomain: string,
): string | null {
    const domain = inboundDomain.toLowerCase();
    const pattern = new RegExp(
        `^ticket\\+([a-z0-9]+)@${domain.replaceAll(".", "\\.")}$`,
        "i",
    );

    for (const recipient of recipients) {
        const email = parseEmailAddress(recipient);
        const match = email.match(pattern);
        if (match?.[1]) return match[1];
    }
    return null;
}

/** Strip common quoted-reply noise from plain-text email bodies. */
export function extractReplyText(body: string): string {
    let text = body.replace(/\r\n/g, "\n").trim();
    const cutPatterns = [
        /\s+On\s+(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)\w*,?.{0,200}?<[^>\n]+>\s*wrote:\s*/i,
        /\nOn\s+.{0,200}?wrote:\s*\n/i,
        /\n-{2,} ?Original Message ?-{2,}/i,
        /\nFrom:\s+.+\nSent:\s+/i,
        /\n_{2,}\n/,
        /\n>+ /,
    ];

    for (const pattern of cutPatterns) {
        const index = text.search(pattern);
        if (index !== -1) text = text.slice(0, index);
    }

    const lines = text.split("\n");
    while (lines.length > 0 && lines[lines.length - 1]!.trim().startsWith(">")) {
        lines.pop();
    }

    return lines.join("\n").trim();
}

async function resolveSenderUser(fromEmail: string) {
    const user = await prisma.user.findFirst({
        where: { email: { equals: fromEmail, mode: "insensitive" } },
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            companyId: true,
        },
    });
    if (user) return user;

    const supportInbox = getSupportInboxEmail()?.toLowerCase();
    if (!supportInbox || supportInbox !== fromEmail) return null;

    // Shared inbox reply with no matching user — attribute to an admin account.
    return prisma.user.findFirst({
        where: { role: "ADMIN" },
        orderBy: { createdAt: "asc" },
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            companyId: true,
        },
    });
}

/**
 * Creates a ticket message from an inbound Resend email (reply-by-email).
 * Returns quietly on ignorable failures so Resend does not keep retrying forever.
 */
export async function processInboundTicketEmail(input: {
    from: string;
    to: string[];
    receivedFor?: string[];
    emailId: string;
}): Promise<{ ok: boolean; reason?: string }> {
    const inboundDomain = getInboundDomain();
    if (!inboundDomain) {
        return { ok: false, reason: "inbound_domain_not_configured" };
    }

    const fromEmail = parseEmailAddress(input.from);
    if (!fromEmail || NOISE_FROM.test(fromEmail)) {
        return { ok: false, reason: "ignored_sender" };
    }

    const recipients = [
        ...input.to,
        ...(input.receivedFor ?? []),
    ];
    const ticketId = parseTicketIdFromRecipients(recipients, inboundDomain);
    if (!ticketId) {
        return { ok: false, reason: "ticket_not_found_in_recipients" };
    }

    const client = getResendClient();
    if (!client) {
        return { ok: false, reason: "resend_not_configured" };
    }

    const { data: email, error } = await client.emails.receiving.get(
        input.emailId,
    );
    if (error || !email) {
        console.error("[email] Failed to fetch inbound email content");
        return { ok: false, reason: "fetch_failed" };
    }

    const rawBody = email.text?.trim() || email.html?.replace(/<[^>]+>/g, " ") || "";
    const content = extractReplyText(rawBody).slice(0, MAX_MESSAGE);
    if (!content) {
        return { ok: false, reason: "empty_body" };
    }

    const sender = await resolveSenderUser(fromEmail);
    if (!sender || (sender.role !== "ADMIN" && sender.role !== "CLIENT")) {
        console.warn("[email] Inbound reply ignored — unknown sender");
        return { ok: false, reason: "unknown_sender" };
    }

    const ticket = await prisma.ticket.findUnique({
        where: { id: ticketId },
        select: {
            id: true,
            companyId: true,
            ticketNumber: true,
            title: true,
            company: { select: { name: true } },
            createdBy: { select: { email: true } },
        },
    });

    if (!ticket) {
        return { ok: false, reason: "ticket_missing" };
    }

    if (sender.role !== "ADMIN" && ticket.companyId !== sender.companyId) {
        console.warn("[email] Inbound reply ignored — sender lacks ticket access");
        return { ok: false, reason: "unauthorized" };
    }

    await prisma.$transaction([
        prisma.ticketMessage.create({
            data: {
                content,
                ticketId: ticket.id,
                senderId: sender.id,
            },
        }),
        prisma.ticket.update({
            where: { id: ticket.id },
            data: { updatedAt: new Date() },
        }),
    ]);

    try {
        await notifyNewMessage({
            ticketId: ticket.id,
            ticketNumber: ticket.ticketNumber,
            ticketTitle: ticket.title,
            companyName: ticket.company.name,
            createdByEmail: ticket.createdBy.email,
            senderRole: sender.role,
            senderName: sender.name,
            senderEmail: sender.email,
            content,
        });
    } catch {
        console.error("[email] Failed to notify after inbound message");
    }

    return { ok: true };
}
