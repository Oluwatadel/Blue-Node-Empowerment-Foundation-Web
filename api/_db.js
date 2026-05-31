import { Pool } from "@neondatabase/serverless";

let pool;

export function getPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set.");
  }

  if (!pool) {
    console.info("[api/content] creating Neon pool");
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 10000,
      max: 1
    });
  }

  return pool;
}
