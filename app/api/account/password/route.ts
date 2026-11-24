import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { getCurrentUser, hashPassword, verifyPassword } from "@/lib/auth";
import { passwordSchema } from "@/lib/validation";
import { apiError, json, serverError, validationError } from "@/lib/http";

const schema = z.object({
  currentPassword: z.string().min(1, "Enter your current password"),
  newPassword: passwordSchema,
});

export async function POST(request: Request) {
  try {
    const current = await getCurrentUser();
    if (!current) return apiError("Please sign in.", 401);

    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return validationError(parsed.error);

    const db = await getDb();
    const [record] = await db
      .select({ passwordHash: users.passwordHash })
      .from(users)
      .where(eq(users.id, current.id))
      .limit(1);

    if (!record || !(await verifyPassword(parsed.data.currentPassword, record.passwordHash))) {
      return apiError("Your current password is incorrect.", 400, {
        currentPassword: "Incorrect current password.",
      });
    }

    await db
      .update(users)
      .set({ passwordHash: await hashPassword(parsed.data.newPassword), updatedAt: new Date() })
      .where(eq(users.id, current.id));

    return json({ ok: true, message: "Password changed successfully." });
  } catch (error) {
    return serverError(error, "password-change");
  }
}
