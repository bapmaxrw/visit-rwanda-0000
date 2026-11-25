import { Pool } from "pg";

async function main() {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    throw new Error("DATABASE_URL is not set. Add the database URL to your local environment first.");
  }

  const pool = new Pool({ connectionString: url, max: 1, connectionTimeoutMillis: 10_000 });
  try {
    const result = await pool.query<{ ok: number }>("SELECT 1 AS ok");
    if (result.rows[0]?.ok !== 1) throw new Error("Database health check returned an unexpected result.");
    console.log("Database connection succeeded (read-only SELECT 1).");
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error("Database connection check failed:", error instanceof Error ? error.message : "Unknown error");
  process.exitCode = 1;
});
