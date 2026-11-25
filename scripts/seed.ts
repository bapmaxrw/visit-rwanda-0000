import fs from "node:fs";

for (const file of [".env.local", ".env"]) {
  if (fs.existsSync(file)) {
    try {
      process.loadEnvFile(file);
      break;
    } catch {
      /* ignore malformed env file */
    }
  }
}

async function main() {
  // Seeding is an explicit operator action, never an implicit page-render side
  // effect. Prefer a dedicated seed/migration role where one is configured.
  const url =
    process.env.SEED_DATABASE_URL?.trim() ||
    process.env.MIGRATION_DATABASE_URL?.trim() ||
    process.env.DATABASE_URL?.trim();
  if (!url) {
    throw new Error(
      "Set SEED_DATABASE_URL, MIGRATION_DATABASE_URL, or DATABASE_URL before seeding PostgreSQL."
    );
  }
  process.env.DATABASE_URL = url;

  const { getDb } = await import("../lib/db");
  const { ensureSeeded } = await import("../lib/db/seed");
  const { count } = await import("drizzle-orm");
  const { destinations, personnel, users } = await import("../lib/db/schema");
  const db = await getDb();

  await ensureSeeded(db);
  const [d] = await db.select({ value: count() }).from(destinations);
  const [p] = await db.select({ value: count() }).from(personnel);
  const [u] = await db.select({ value: count() }).from(users);
  console.log(`Seed complete: ${d.value} destinations, ${p.value} people/team profiles, ${u.value} users.`);
}

main().catch((error) => {
  console.error("Database seed failed:", error instanceof Error ? error.message : "Unknown error");
  process.exitCode = 1;
});
