/**
 * Creates (or promotes) the initial administrator account.
 *
 *   npm run admin:create -- --email you@example.com --password 'StrongPass123' --name "Your Name"
 *
 * Credentials are never written to source files. Environment variables
 * ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_NAME are used as a fallback.
 */
import fs from "node:fs";
import { eq } from "drizzle-orm";

for (const file of [".env.local", ".env"]) {
  if (fs.existsSync(file)) {
    try {
      process.loadEnvFile(file);
      break;
    } catch {
      /* ignore */
    }
  }
}

function arg(name: string): string | undefined {
  const index = process.argv.indexOf(`--${name}`);
  return index > -1 ? process.argv[index + 1] : undefined;
}

async function main() {
  const email = (arg("email") ?? process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
  const password = arg("password") ?? process.env.ADMIN_PASSWORD ?? "";
  const name = arg("name") ?? process.env.ADMIN_NAME ?? "Visit Rwanda Administrator";
  const phone = arg("phone") ?? process.env.ADMIN_PHONE ?? "+250700000000";

  if (!email || !password) {
    console.error("Provide --email and --password (or set ADMIN_EMAIL / ADMIN_PASSWORD).");
    process.exit(1);
  }
  if (password.length < 10 || !/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    console.error("Administrator password must be at least 10 characters and include letters and numbers.");
    process.exit(1);
  }

  const { getDb } = await import("../lib/db");
  const { users } = await import("../lib/db/schema");
  const { hashPassword } = await import("../lib/password");

  const db = await getDb();
  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);

  if (existing.length) {
    await db
      .update(users)
      .set({ role: "admin", passwordHash: await hashPassword(password), fullName: name })
      .where(eq(users.id, existing[0].id));
    console.log(`Promoted existing account ${email} to administrator and reset its password.`);
  } else {
    await db.insert(users).values({
      fullName: name,
      email,
      phone,
      passwordHash: await hashPassword(password),
      role: "admin",
      nationality: "Rwanda",
      hasNationalId: false,
    });
    console.log(`Created administrator ${email}.`);
  }
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
