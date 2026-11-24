import path from "node:path";
import { drizzle as drizzleNode, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { migrate as migrateNode } from "drizzle-orm/node-postgres/migrator";
import { migrate as migratePglite } from "drizzle-orm/pglite/migrator";
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
const migrationsFolder = path.join(process.cwd(), "drizzle");

async function connect(): Promise<Database> {
  const connectionString = process.env.DATABASE_URL?.trim();

  if (connectionString) {
    const pool = new Pool({
      connectionString,
      max: 5,
      ssl: connectionString.includes("localhost") || connectionString.includes("127.0.0.1")
        ? undefined
        : { rejectUnauthorized: false },
    });
    const db = drizzleNode(pool, { schema });
    g.__vrPool = pool;
    await migrateNode(db, { migrationsFolder });
    return db;
  }

  // Local development: embedded PostgreSQL (real Postgres engine via WASM).
  // Production must provide DATABASE_URL.
  const client = new PGlite(path.join(process.cwd(), ".pglite"));
  const db = drizzlePglite(client, { schema });
  g.__vrPglite = client;
  await migratePglite(db, { migrationsFolder });
  return db as unknown as Database;
}

/** Returns the singleton database, applying migrations once per process. */
export function getDb(): Promise<Database> {
  if (!g.__vrDb) {
    g.__vrDb = (async () => {
      const db = await connect();
      const { ensureSeeded } = await import("./seed");
      await ensureSeeded(db);
      return db;
    })().catch((error) => {
      g.__vrDb = undefined;
      throw error;
    });
  }
  return g.__vrDb;
}

export { schema };
