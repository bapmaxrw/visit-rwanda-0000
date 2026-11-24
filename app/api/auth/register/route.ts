import { eq, or } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { hashPassword, createSession, toSafeUser } from "@/lib/auth";
import { registerSchema } from "@/lib/validation";
import { apiError, json, normalizePhone, serverError, validationError } from "@/lib/http";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = registerSchema.safeParse(payload);
    if (!parsed.success) return validationError(parsed.error);

    const data = parsed.data;
    const db = await getDb();
    const email = data.email.trim().toLowerCase();
    const phone = normalizePhone(data.phone);

    const existing = await db
      .select({ id: users.id, email: users.email, phone: users.phone })
      .from(users)
      .where(or(eq(users.email, email), eq(users.phone, phone)))
      .limit(1);

    if (existing.length) {
      return apiError("An account already exists with this email or telephone number.", 409, {
        ...(existing[0].email === email ? { email: "This email is already registered." } : {}),
        ...(existing[0].phone === phone ? { phone: "This telephone number is already registered." } : {}),
      });
    }

    const [created] = await db
      .insert(users)
      .values({
        fullName: data.fullName.trim(),
        email,
        phone,
        passwordHash: await hashPassword(data.password),
        dateOfBirth: data.dateOfBirth,
        nationality: data.nationality,
        hasNationalId: data.hasNationalId,
        nationalId: data.hasNationalId ? data.nationalId?.trim() || null : null,
        role: "user",
      })
      .returning();

    await createSession(created.id, false);
    return json({ user: toSafeUser(created) }, 201);
  } catch (error) {
    return serverError(error, "register");
  }
}
