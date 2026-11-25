import fs from "node:fs";
import path from "node:path";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";

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

async function main() {
  // Prefer a separately managed migration credential. The normal DATABASE_URL
  // remains a fallback for local development and simple single-role setups.
  const url = process.env.MIGRATION_DATABASE_URL?.trim() || process.env.DATABASE_URL?.trim();
  if (!url) {
    throw new Error(
      "Set MIGRATION_DATABASE_URL (recommended) or DATABASE_URL before applying PostgreSQL migrations."
    );
  }

  const pool = new Pool({ connectionString: url, max: 1, connectionTimeoutMillis: 10_000 });
  try {
    await migrate(drizzle(pool), { migrationsFolder: path.join(process.cwd(), "drizzle") });
    console.log("Migrations applied to the configured PostgreSQL database.");
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  // Do not print connection configuration or credentials.
  console.error("Database migration failed:", error instanceof Error ? error.message : "Unknown error");
  process.exitCode = 1;
});
