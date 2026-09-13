import type { RowDataPacket } from 'mysql2/promise';
import type { z } from 'zod';
import type { eventSchema } from '../../shared/validation';
import { pool } from '../db/client';
/** Use the same row lock as signup so an edit cannot undercut existing reservations. */
export async function updateEvent(id: string, data: z.infer<typeof eventSchema>) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [existing] = await connection.execute<RowDataPacket[]>(
      'SELECT id FROM events WHERE id=? FOR UPDATE',
      [id],
    );
    if (!existing.length) throw Object.assign(new Error('活动不存在'), { status: 404 });
    const [count] = await connection.execute<RowDataPacket[]>(
      'SELECT COUNT(*) total FROM event_attendees WHERE eventId=?',
      [id],
    );
    if (data.capacity < count[0].total)
      throw Object.assign(new Error('人数上限不能小于当前报名人数'), { status: 409 });
    await connection.execute(
      'UPDATE events SET title=?,date=?,place=?,brief=?,body=?,image=?,category=?,capacity=? WHERE id=?',
      [
        data.title,
        data.date,
        data.place,
        data.brief,
        data.body,
        data.image,
        data.category,
        data.capacity,
        id,
      ],
    );
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
