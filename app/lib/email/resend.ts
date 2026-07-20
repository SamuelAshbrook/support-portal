import { Resend } from "resend";

export type SendEmailInput = {
    to: string | string[];
    subject: string;
    text: string;
    html: string;
};

function getFromAddress(): string | null {
    const email = process.env.RESEND_FROM_EMAIL?.trim();
    if (!email) return null;

    const name = process.env.RESEND_FROM_NAME?.trim();
    return name ? `${name} <${email}>` : email;
}

function getClient(): Resend | null {
    const apiKey = process.env.RESEND_API_KEY?.trim();
    if (!apiKey) return null;
    return new Resend(apiKey);
}

/**
 * Sends an email via Resend.
 */
export async function sendEmail(input: SendEmailInput): Promise<boolean> {
    const client = getClient();
    const from = getFromAddress();

    if (!client || !from) {
        console.warn(
            "[email] Skipping send — RESEND_API_KEY or RESEND_FROM_EMAIL is not set",
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
