import "server-only";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/db/schema";

export const hasDatabase = Boolean(process.env.DATABASE_URL);

// Next reloads modules on every edit in dev; without a global the process
// would open a new pool each time and exhaust the connection limit.
const globalForDb = globalThis as unknown as {
  mybeatsDb?: PostgresJsDatabase<typeof schema>;
};

/**
 * The real Drizzle instance. Use this where a library inspects the object
 * itself (the Auth.js adapter sniffs the driver type, which the proxy below
 * would defeat). Throws when no DATABASE_URL is configured.
 */
export function getDb(): PostgresJsDatabase<typeof schema> {
  globalForDb.mybeatsDb ??= createDb();
  return globalForDb.mybeatsDb;
}

function createDb(): PostgresJsDatabase<typeof schema> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set — Google sign-in and saved favorites need a Postgres connection string in .env."
    );
  }
  const client = postgres(connectionString, { max: 5, prepare: false });
  return drizzle(client, { schema });
}

// Lazy: importing this module must stay safe when DATABASE_URL is absent, so
// the Audius-only paths keep working and only DB access fails loudly.
export const db = new Proxy({} as PostgresJsDatabase<typeof schema>, {
  get(_target, prop, receiver) {
    globalForDb.mybeatsDb ??= createDb();
    return Reflect.get(globalForDb.mybeatsDb, prop, receiver);
  },
});
