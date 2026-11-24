import { getCurrentUser } from "@/lib/auth";
import { storeMedia, UploadError } from "@/lib/upload";
import { apiError, json, serverError } from "@/lib/http";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") return apiError("Administrator access required.", 403);

    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return apiError("Select an image or video to upload.");

    const asset = await storeMedia(file, user.id);
    return json({ ok: true, url: asset.url, id: asset.id, kind: asset.kind }, 201);
  } catch (error) {
    if (error instanceof UploadError) return apiError(error.message, 400);
    return serverError(error, "upload");
  }
}
