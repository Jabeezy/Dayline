import pg from 'pg';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('railway') ? { rejectUnauthorized: false } : false,
});

// Without this, an unexpected error on an idle client (a dropped connection,
// a query against a missing table, etc.) is treated as an uncaught exception
// and crashes the entire Node process instead of just failing that request.
pool.on('error', (err) => {
  console.error('Unexpected Postgres pool error:', err);
});