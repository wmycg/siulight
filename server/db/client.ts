import mysql, { type RowDataPacket, type ResultSetHeader } from 'mysql2/promise';
import { config } from '../config';
export const pool = mysql.createPool({
  uri: config.databaseUrl,
  connectionLimit: 10,
  dateStrings: true,
  timezone: 'Z',
  charset: 'utf8mb4',
});
export type SqlValue = string | number | boolean | null | Date | Buffer;
export async function rows<T>(sql: string, values: SqlValue[] = []): Promise<T[]> {
  const [result] = await pool.execute<RowDataPacket[]>(sql, values);
  return result as T[];
}
export async function run(sql: string, values: SqlValue[] = []) {
  const [result] = await pool.execute<ResultSetHeader>(sql, values);
  return result;
}
