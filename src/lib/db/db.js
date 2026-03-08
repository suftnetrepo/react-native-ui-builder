import { Pool } from 'pg';

const globalForPg = globalThis;

console.log('DATABASE_URL:', process.env.DATABASE_URL);

export const pool =
  globalForPg.pgPool ||
  new Pool({
    connectionString: process.env.DATABASE_URL,
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPg.pgPool = pool;
}