import { and, eq, gt, isNull } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { passwordResetTokens, sessions, users } from "@/lib/db/schema";
import { hashToken, hashPassword } from "@/lib/auth";
import { apiError, json, serverError, validationError } from "@/lib/http";
import { passwordSchema } from "@/lib/validation";

const schema = z.object({ token: z.string().min(10), password: passwordSchema });

export async function POST(request: Request) {
  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return validationError(parsed.error);

    const db = await getDb();
    const [record] = await db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.tokenHash, hashToken(parsed.data.token)),
          gt(passwordResetTokens.expiresAt, new Date()),
          isNull(passwordResetTokens.usedAt)
        )
      )
      .limit(1);

    if (!record) return apiError("This reset link is invalid or has expired.", 400);

    await db
      .update(users)
      .set({ passwordHash: await hashPassword(parsed.data.password), updatedAt: new Date() })
      .where(eq(users.id, record.userId));
    await db
      .update(passwordResetTokens)
      .set({ usedAt: new Date() })
      .where(eq(passwordResetTokens.id, record.id));
    // Sign out every existing session after a password reset.
    await db.delete(sessions).where(eq(sessions.userId, record.userId));

    return json({ ok: true, message: "Password updated. You can now sign in." });
  } catch (error) {
    return serverError(error, "reset-password");
  }
}
