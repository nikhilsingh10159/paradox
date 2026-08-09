import { neon } from '@neondatabase/serverless';

export function getDb() {
  if (!process.env.DATABASE_URL) {
    return null;
  }
  const sql = neon(process.env.DATABASE_URL);
  return sql;
}

export async function initDbTables() {
  const sql = getDb();
  if (!sql) return;

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      address VARCHAR(255) PRIMARY KEY,
      handle VARCHAR(255),
      role VARCHAR(50),
      bio TEXT,
      skills JSONB,
      avatar TEXT,
      reputation JSONB
    );
  `;
}
