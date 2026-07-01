import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { getSession } from "@/app/lib/session";

export async function POST(request: Request) {
    const body = (await request.json()) as HandleUploadBody;
    const json = await handleUpload({
        body,
        request,
        onBeforeGenerateToken: async () => {
            const session = await getSession();
            if (!session || session.user.role !== "CLIENT")
                throw new Error("Unauthorized");

            return {
                allowedContentTypes: ["image/jpeg", "image/png", "image/webp"],
                maximumSizeInBytes: 10 * 1024 * 1024, // 10MB
            };
        },
        onUploadCompleted: async () => {},
    });
    return Response.json(json);
}