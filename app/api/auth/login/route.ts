import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { verifyPassword, createSession, findUserByIdentifier, toSafeUser } from "@/lib/auth";
import { loginSchema } from "@/lib/validation";
import { apiError, json, serverError, validationError } from "@/lib/http";

export async function POST(request: Request) {
  try {
    const parsed = loginSchema.safeParse(await request.json());
    if (!parsed.success) return validationError(parsed.error);

    const found = await findUserByIdentifier(parsed.data.identifier);
    const db = await getDb();

    if (!found || !(await verifyPassword(parsed.data.password, found.passwordHash))) {
      return apiError("The email, username or telephone number and password do not match.", 401);
    }

    await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, found.id));
    await createSession(found.id, Boolean(parsed.data.remember));

    return json({
      user: toSafeUser(found),
      redirect: found.role === "admin" ? "/admin" : "/dashboard",
    });
  } catch (error) {
    return serverError(error, "login");
  }
}
