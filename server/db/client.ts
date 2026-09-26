import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../generated/prisma/client';
import { config } from '../config';

const url = new URL(config.databaseUrl);
const adapter = new PrismaMariaDb({
  host: url.hostname,
  port: Number(url.port || 3306),
  user: decodeURIComponent(url.username),
  password: decodeURIComponent(url.password),
  database: url.pathname.slice(1),
  connectionLimit: 10,
  timezone: 'Z',
  connectTimeout: 10_000,
});

export const prisma = new PrismaClient({ adapter });

export const toDatabaseDate = (value: string) => new Date(`${value}T12:00:00+08:00`);

export type SqlValue = string | number | boolean | null | Date | Buffer;

function normalize(value: unknown): unknown {
  if (value instanceof Date) {
    const iso = value.toISOString();
    return iso.slice(11, 19) === '00:00:00' ? iso.slice(0, 10) : iso.slice(0, 19).replace('T', ' ');
  }
  if (typeof value === 'bigint') return Number(value);
  if (Array.isArray(value)) return value.map(normalize);
  if (value && typeof value === 'object')
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, normalize(item)]));
  return value;
}

/** Transitional helper for the few reporting queries that remain SQL-shaped. */
export async function rows<T>(sql: string, values: SqlValue[] = []): Promise<T[]> {
  const result = await prisma.$queryRawUnsafe<unknown[]>(sql, ...values);
  return normalize(result) as T[];
}

export async function run(sql: string, values: SqlValue[] = []) {
  const affectedRows = await prisma.$executeRawUnsafe(sql, ...values);
  return { affectedRows };
}

export async function closeDatabase() {
  await prisma.$disconnect();
}
