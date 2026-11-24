import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { storeMedia, UploadError } from "@/lib/upload";
import { apiError, json, serverError } from "@/lib/http";

export async function POST(request: Request) {
  try {
    const current = await getCurrentUser();
    if (!current) return apiError("Please sign in.", 401);

    const form = await request.formData();
    const file = form.get("avatar");
    if (!(file instanceof File)) return apiError("Select an image to upload.");

    const asset = await storeMedia(file, current.id);
    const db = await getDb();
    await db
      .update(users)
      .set({ avatarMediaId: asset.id, updatedAt: new Date() })
      .where(eq(users.id, current.id));

    return json({ ok: true, url: asset.url });
  } catch (error) {
    if (error instanceof UploadError) return apiError(error.message, 400);
    return serverError(error, "avatar");
  }
}
