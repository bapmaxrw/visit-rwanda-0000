import { siteSettings } from "@/lib/db/schema";
import { getDb } from "@/lib/db";
import { apiError, databaseError, json, serverError } from "@/lib/http";
import { RESOURCE_TABLES, guardAdmin, isResourceKey, listOrder, sanitizeRow } from "@/lib/admin-api";

export async function GET(_request: Request, { params }: { params: Promise<{ resource: string }> }) {
  try {
    const guard = await guardAdmin();
    if (guard.error) return guard.error;

    const { resource } = await params;
    if (!isResourceKey(resource)) return apiError("Unknown resource.", 404);

    const db = await getDb();
    const table = RESOURCE_TABLES[resource];
    const order = listOrder(table);
    const query = db.select().from(table as never);
    const rows = await (order ? query.orderBy(order) : query).limit(500);
    return json({ rows });
  } catch (error) {
    return serverError(error, "admin-list");
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ resource: string }> }) {
  try {
    const guard = await guardAdmin();
    if (guard.error) return guard.error;

    const { resource } = await params;
    if (!isResourceKey(resource)) return apiError("Unknown resource.", 404);
    const body = (await request.json()) as Record<string, unknown>;
    const db = await getDb();

    if (resource === "settings") {
      const key = String(body.key ?? "").trim();
      const value = String(body.value ?? "").trim();
      if (!key || !value) return apiError("Both a key and a value are required.");
      await db
        .insert(siteSettings)
        .values({ key, value, updatedAt: new Date() })
        .onConflictDoUpdate({ target: siteSettings.key, set: { value, updatedAt: new Date() } });
      return json({ ok: true }, 201);
    }

    const table = RESOURCE_TABLES[resource];
    const values = sanitizeRow(table, body);
    const rows = (await db
      .insert(table as never)
      .values(values as never)
      .returning()) as Record<string, unknown>[];
    return json({ row: rows[0] }, 201);
  } catch (error) {
    return databaseError(error, "admin-create");
  }
}
