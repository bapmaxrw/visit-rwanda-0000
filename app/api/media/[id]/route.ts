import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { mediaAssets } from "@/lib/db/schema";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return new Response("Not found", { status: 404 });

  const db = await getDb();
  const [asset] = await db
    .select({ mimeType: mediaAssets.mimeType, dataBase64: mediaAssets.dataBase64 })
    .from(mediaAssets)
    .where(eq(mediaAssets.id, id))
    .limit(1);

  if (!asset) return new Response("Not found", { status: 404 });

  const bytes = Buffer.from(asset.dataBase64, "base64");
  return new Response(new Uint8Array(bytes), {
    headers: {
      "Content-Type": asset.mimeType,
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Length": String(bytes.length),
    },
  });
}
