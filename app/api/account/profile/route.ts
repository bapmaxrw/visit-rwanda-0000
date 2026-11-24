import { and, eq, ne } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { profileSchema } from "@/lib/validation";
import { apiError, json, normalizePhone, serverError, validationError } from "@/lib/http";

export async function PATCH(request: Request) {
  try {
    const current = await getCurrentUser();
    if (!current) return apiError("Please sign in.", 401);

    const parsed = profileSchema.safeParse(await request.json());
    if (!parsed.success) return validationError(parsed.error);

    const data = parsed.data;
    const phone = normalizePhone(data.phone);
    const db = await getDb();

    const taken = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.phone, phone), ne(users.id, current.id)))
      .limit(1);
    if (taken.length) {
      return apiError("That telephone number is already registered.", 409, {
        phone: "This telephone number is already registered.",
      });
    }

    await db
      .update(users)
      .set({
        fullName: data.fullName.trim(),
        phone,
        dateOfBirth: data.dateOfBirth || null,
        nationality: data.nationality || null,
        hasNationalId: data.hasNationalId,
        nationalId: data.hasNationalId ? data.nationalId?.trim() || null : null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, current.id));

    return json({ ok: true, message: "Profile updated." });
  } catch (error) {
    return serverError(error, "profile-update");
  }
}
