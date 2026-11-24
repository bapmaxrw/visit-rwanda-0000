import { randomBytes, createHash, createHmac } from "node:crypto";
import { cookies } from "next/headers";
import { and, eq, gt, or, sql } from "drizzle-orm";
import { getDb } from "./db";
import { sessions, users, type User } from "./db/schema";
import { authSecretOrNull } from "./auth-secret";
import { normalizePhone } from "./http";

export { hashPassword, verifyPassword } from "./password";

const SESSION_COOKIE = "vr_session";
const SESSION_SIGNATURE_COOKIE = "vr_session_sig";
const SESSION_DAYS = 30;
const SESSION_HOURS = 12;

function authSecret(): string {
  const secret = authSecretOrNull();
  if (!secret) {
    throw new Error(
      "AUTH_SECRET is not set. Generate one with `node -e \"console.log(require('crypto').randomBytes(48).toString('hex'))\"` and set it before starting the app in production."
    );
  }
  return secret;
}

/**
 * Short signature kept in its own cookie so the middleware can reject requests
 * that carry no real session before any protected page is rendered. The token
 * itself is still validated against the database by the page layout.
 */
function signSessionToken(token: string): string {
  return createHmac("sha256", authSecret()).update(token).digest("base64url");
}

export function hashToken(token: string): string {
  return createHash("sha256")
    .update(`${token}${authSecret()}`)
    .digest("hex");
}

export type SafeUser = Omit<User, "passwordHash" | "nationalId"> & {
  hasNationalId: boolean;
  avatarUrl: string | null;
};

export function toSafeUser(user: User): SafeUser {
  const { passwordHash: _p, nationalId: _n, ...rest } = user;
  return {
    ...rest,
    hasNationalId: user.hasNationalId,
    avatarUrl: user.avatarMediaId ? `/api/media/${user.avatarMediaId}` : null,
  };
}

/**
 * Resolves what someone typed into the sign-in field: a full email address, a
 * telephone number, or the username part of their email (so the administrator
 * account admin@visitrwanda.academy can sign in as "admin").
 *
 * Usernames are matched only when exactly one account uses that local part;
 * otherwise the result is null and the caller shows the generic error, so two
 * accounts can never be confused for one another.
 */
export async function findUserByIdentifier(identifier: string): Promise<User | null> {
  const value = identifier.trim();
  if (!value) return null;

  const db = await getDb();
  const [direct] = await db
    .select()
    .from(users)
    .where(or(eq(users.email, value.toLowerCase()), eq(users.phone, normalizePhone(value))))
    .limit(1);
  if (direct) return direct;

  if (value.includes("@")) return null;
  const localPart = value.toLowerCase();
  if (!/^[a-z0-9][a-z0-9._+-]*$/.test(localPart)) return null;

  const matches = await db
    .select()
    .from(users)
    .where(sql`lower(split_part(${users.email}, '@', 1)) = ${localPart}`)
    .limit(2);
  if (matches.length === 1) return matches[0];

  // "admin" stays the administrator's username even when their email address
  // is a personal one. Only resolves while exactly one administrator exists.
  if (localPart === "admin") {
    const admins = await db.select().from(users).where(eq(users.role, "admin")).limit(2);
    return admins.length === 1 ? admins[0] : null;
  }

  return null;
}

export async function createSession(userId: string, remember: boolean): Promise<void> {
  const db = await getDb();
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(
    Date.now() + (remember ? SESSION_DAYS * 86400_000 : SESSION_HOURS * 3600_000)
  );
  await db.insert(sessions).values({ userId, tokenHash: hashToken(token), expiresAt });
  const jar = await cookies();
  const options = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    ...(remember ? { maxAge: SESSION_DAYS * 86400 } : {}),
  };
  jar.set(SESSION_COOKIE, token, options);
  jar.set(SESSION_SIGNATURE_COOKIE, signSessionToken(token), options);
}

export async function destroyCurrentSession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    const db = await getDb();
    await db.delete(sessions).where(eq(sessions.tokenHash, hashToken(token)));
  }
  jar.delete(SESSION_COOKIE);
  jar.delete(SESSION_SIGNATURE_COOKIE);
}

export async function getCurrentUser(): Promise<SafeUser | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const db = await getDb();
  const rows = await db
    .select({ user: users })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(and(eq(sessions.tokenHash, hashToken(token)), gt(sessions.expiresAt, new Date())))
    .limit(1);
  if (!rows.length) return null;
  return toSafeUser(rows[0].user);
}

export async function requireUser(): Promise<SafeUser> {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}

export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.role === "admin";
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE;
export const SESSION_SIGNATURE_COOKIE_NAME = SESSION_SIGNATURE_COOKIE;
