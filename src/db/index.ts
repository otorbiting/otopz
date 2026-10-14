import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

const basePool =
  globalForDb.__arenaNextJsPostgresqlPool ??
  new Pool({
    ...(databaseUrl ? { connectionString: databaseUrl } : {}),
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__arenaNextJsPostgresqlPool = basePool;
}

export const pool = new Proxy(basePool, {
  get(target, property, receiver) {
    if (!databaseUrl && (property === "query" || property === "connect")) {
      return () => {
        throw new Error(
          "DATABASE_URL is required to use database-backed features. Configure it in the runtime environment."
        );
      };
    }

    const value = Reflect.get(target, property, receiver);
    return typeof value === "function" ? value.bind(target) : value;
  },
});

export const db = drizzle(pool, { schema });
export * from "./schema";
