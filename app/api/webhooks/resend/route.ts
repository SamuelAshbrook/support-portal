import { NextResponse } from "next/server";
import { getResendClient } from "@/app/lib/email/resend";
import { processInboundTicketEmail } from "@/app/lib/email/inbound";

export async function POST(request: Request) {
    const client = getResendClient();
    const webhookSecret = process.env.RESEND_WEBHOOK_SECRET?.trim();

    if (!client || !webhookSecret) {
        console.warn("[email] Resend webhook not configured");
        return NextResponse.json(
            { error: "Webhook not configured" },
            { status: 503 },
        );
    }

    const payload = await request.text();

    let event: ReturnType<typeof client.webhooks.verify>;
    try {
        event = client.webhooks.verify({
            payload,
            headers: {
                id: request.headers.get("svix-id") ?? "",
                timestamp: request.headers.get("svix-timestamp") ?? "",
                signature: request.headers.get("svix-signature") ?? "",
            },
            webhookSecret,
        });
    } catch {
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    if (event.type !== "email.received") {
        return NextResponse.json({ received: true });
    }

    const data = event.data;
    try {
        await processInboundTicketEmail({
            from: data.from,
            to: data.to,
            receivedFor: data.received_for,
            emailId: data.email_id,
        });
    } catch {
        console.error("[email] Inbound webhook processing failed");
        // Still 200 so Resend does not hammer retries for permanent app errors.
    }

    return NextResponse.json({ received: true });
}
