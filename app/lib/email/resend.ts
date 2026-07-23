import { Resend } from "resend";

export type SendEmailInput = {
    to: string | string[];
    subject: string;
    text: string;
    html: string;
    replyTo?: string;
};

export function getResendClient(): Resend | null {
    const apiKey = process.env.RESEND_API_KEY?.trim();
    if (!apiKey) return null;
    return new Resend(apiKey);
}

function getFromAddress(): string | null {
    const email = process.env.RESEND_FROM_EMAIL?.trim();
    if (!email) return null;

    const name = process.env.RESEND_FROM_NAME?.trim();
    return name ? `${name} <${email}>` : email;
}

/**
 * Sends an email via Resend. Soft-fails (returns false) when env is missing
 * or the API errors so ticket mutations never fail because of mail delivery.
 * Does not log message bodies or recipient PII beyond Resend's own error text.
 */
export async function sendEmail(input: SendEmailInput): Promise<boolean> {
    const client = getResendClient();
    const from = getFromAddress();

    if (!client || !from) {
        console.warn(
            "[email] Skipping send - RESEND_API_KEY or RESEND_FROM_EMAIL is not set",
        );
        return false;
    }

    try {
        const { error } = await client.emails.send({
            from,
            to: input.to,
            subject: input.subject,
            text: input.text,
            html: input.html,
            replyTo: input.replyTo,
        });

        if (error) {
            console.error("[email] Resend send failed:", error.message);
            return false;
        }

        return true;
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Unknown email error";
        console.error("[email] Resend send failed:", message);
        return false;
    }
}

export function getSupportInboxEmail(): string | null {
    return process.env.SUPPORT_INBOX_EMAIL?.trim() || null;
}

export function getInboundDomain(): string | null {
    const raw = process.env.RESEND_INBOUND_DOMAIN?.trim().toLowerCase();
    if (!raw) return null;

    const withoutMailto = raw.replace(/^mailto:/, "");
    const at = withoutMailto.lastIndexOf("@");
    const domain = (at >= 0 ? withoutMailto.slice(at + 1) : withoutMailto)
        .replace(/^@+/, "")
        .replace(/\/$/, "");

    if (!domain || domain.includes("@")) return null;
    return domain;
}

/** Reply-To address that maps an inbound reply back to a ticket. */
export function ticketReplyToAddress(ticketId: string): string | undefined {
    const domain = getInboundDomain();
    if (!domain || !ticketId.trim()) return undefined;
    return `ticket+${ticketId.trim()}@${domain}`;
}

export function getAppUrl(): string {
    const url =
        process.env.APP_URL?.trim() ||
        process.env.BETTER_AUTH_URL?.trim() ||
        "http://localhost:3000";
    return url.replace(/\/$/, "");
}

export function ticketUrl(ticketId: string): string {
    return `${getAppUrl()}/tickets/${ticketId}`;
}
