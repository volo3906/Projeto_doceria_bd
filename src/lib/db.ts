import { Pool } from "pg";

// pool de conexoes — usa globalThis pra evitar leak em hot reload
const g = globalThis as any;
if (!g.pool) {
  g.pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
  });
}
const pool: Pool = g.pool;

export default pool;
