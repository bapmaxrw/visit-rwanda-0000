import { getDb } from "./db";
import { mediaAssets } from "./db/schema";

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const VIDEO_TYPES = new Set(["video/mp4", "video/webm"]);

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const MAX_VIDEO_BYTES = 24 * 1024 * 1024;

export class UploadError extends Error {}

/**
 * Stores an uploaded image or background video in PostgreSQL and returns its
 * served URL. Video is limited so a single request can never exhaust the row.
 */
export async function storeMedia(
  file: File,
  uploadedBy: string | null
): Promise<{ id: string; url: string; kind: "image" | "video" }> {
  const kind = IMAGE_TYPES.has(file.type) ? "image" : VIDEO_TYPES.has(file.type) ? "video" : null;

  if (!kind) {
    throw new UploadError("Use a JPEG, PNG, WebP or GIF image, or an MP4/WebM video.");
  }
  if (kind === "image" && file.size > MAX_IMAGE_BYTES) {
    throw new UploadError("Images must be 4 MB or smaller.");
  }
  if (kind === "video" && file.size > MAX_VIDEO_BYTES) {
    throw new UploadError("Background videos must be 24 MB or smaller.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const db = await getDb();
  const [asset] = await db
    .insert(mediaAssets)
    .values({
      filename: file.name.slice(0, 200) || "upload",
      mimeType: file.type,
      sizeBytes: buffer.length,
      dataBase64: buffer.toString("base64"),
      uploadedBy,
    })
    .returning({ id: mediaAssets.id });

  return { id: asset.id, url: `/api/media/${asset.id}`, kind };
}
