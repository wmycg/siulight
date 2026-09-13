import { readFile } from 'node:fs/promises';
import { pool } from './client';
try {
  await pool.query(
    'CREATE TABLE IF NOT EXISTS schema_migrations (version INT PRIMARY KEY, appliedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP)',
  );
  const [existing] = await pool.query('SELECT version FROM schema_migrations WHERE version=1');
  if (!(existing as unknown[]).length) {
    const sql = await readFile(new URL('./schema.sql', import.meta.url), 'utf8');
    for (const statement of sql
      .split(';')
      .map((s) => s.trim())
      .filter(Boolean))
      await pool.query(statement);
    await pool.query('INSERT INTO schema_migrations (version) VALUES (1)');
    console.log('Migration 001 applied.');
  } else console.log('Database schema is up to date.');
} finally {
  await pool.end();
}
