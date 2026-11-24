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
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.log("DATABASE_URL is not set: local PGlite applies migrations automatically on first request.");
    return;
  }
  const pool = new Pool({ connectionString: url });
  await migrate(drizzle(pool), { migrationsFolder: path.join(process.cwd(), "drizzle") });
  await pool.end();
  console.log("Migrations applied to the configured PostgreSQL database.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
