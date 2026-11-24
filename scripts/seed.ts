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
  const { getDb } = await import("../lib/db");
  const db = await getDb();
  const { count } = await import("drizzle-orm");
  const { destinations, personnel, users } = await import("../lib/db/schema");
  const [d] = await db.select({ value: count() }).from(destinations);
  const [p] = await db.select({ value: count() }).from(personnel);
  const [u] = await db.select({ value: count() }).from(users);
  console.log(`Seed complete: ${d.value} destinations, ${p.value} people/team profiles, ${u.value} users.`);
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
