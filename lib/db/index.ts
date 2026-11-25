import path from "node:path";
import { drizzle as drizzleNode, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { Pool } from "pg";
import { PGlite } from "@electric-sql/pglite";
import * as schema from "./schema";

export type Database = NodePgDatabase<typeof schema>;

type Globals = typeof globalThis & {
  __vrDb?: Promise<Database>;
  __vrPool?: Pool;
  __vrPglite?: PGlite;
};

const g = globalThis as Globals;

async function connect(): Promise<Database> {
  const connectionString = process.env.DATABASE_URL?.trim();

  if (connectionString) {
    const pool = new Pool({
      connectionString,
      // Keep each serverless instance's connection footprint small. The global
      // singleton below lets warm instances reuse this pool between requests.
      max: 1,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 10_000,
      ssl: connectionString.includes("localhost") || connectionString.includes("127.0.0.1")
        ? undefined
        : { rejectUnauthorized: false },
    });
    g.__vrPool = pool;
    return drizzleNode(pool, { schema });
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "DATABASE_URL is required in production. Configure a hosted PostgreSQL connection in the deployment environment."
    );
  }

  // Local development only. Persistent production data must use hosted PostgreSQL.
  const client = new PGlite(path.join(process.cwd(), ".pglite"));
  g.__vrPglite = client;
  return drizzlePglite(client, { schema }) as unknown as Database;
}

/** Returns the process-level database connection. Schema changes are never run
 * on a page/API request: use the explicit `npm run db:migrate` deployment step.
 */
export function getDb(): Promise<Database> {
  if (!g.__vrDb) {
    g.__vrDb = connect().catch((error) => {
      g.__vrDb = undefined;
      throw error;
    });
  }
  return g.__vrDb;
}

export { schema };
