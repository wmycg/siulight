import { Router } from 'express';
import { z } from 'zod';
import type { RowDataPacket } from 'mysql2/promise';
import { rows, pool } from '../db/client';
import { authenticated } from '../middleware/auth';
import type { ClubEvent } from '../../shared/types';
export const eventRouter = Router();
eventRouter.get('/', async (req, res) => {
  const items = await rows<ClubEvent>(
    'SELECT e.*,(SELECT COUNT(*) FROM event_attendees a WHERE a.eventId=e.id) attendees,EXISTS(SELECT 1 FROM event_attendees a WHERE a.eventId=e.id AND a.userId=?) joined FROM events e ORDER BY e.date DESC LIMIT 200',
    [req.user?.id || ''],
  );
  res.json(items.map((e) => ({ ...e, joined: Boolean(e.joined) })));
});
eventRouter.put('/:id/join', authenticated, async (req, res) => {
  const id = z.string().uuid().parse(req.params.id);
  const { joined } = z.object({ joined: z.boolean() }).parse(req.body);
  const c = await pool.getConnection();
  try {
    await c.beginTransaction();
    const [events] = await c.execute<RowDataPacket[]>(
      'SELECT * FROM events WHERE id=? FOR UPDATE',
      [id],
    );
    if (!events[0]) throw Object.assign(new Error('活动不存在'), { status: 404 });
    if (joined) {
      if (events[0].date < new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Shanghai' }))
        throw Object.assign(new Error('活动已结束'), { status: 400 });
      const [existing] = await c.execute<RowDataPacket[]>(
        'SELECT userId FROM event_attendees WHERE eventId=? AND userId=?',
        [id, req.user!.id],
      );
      const [counts] = await c.execute<RowDataPacket[]>(
        'SELECT COUNT(*) total FROM event_attendees WHERE eventId=?',
        [id],
      );
      if (!existing.length && counts[0].total >= events[0].capacity)
        throw Object.assign(new Error('活动名额已满'), { status: 409 });
      await c.execute('INSERT IGNORE INTO event_attendees (eventId,userId) VALUES (?,?)', [
        id,
        req.user!.id,
      ]);
    } else
      await c.execute('DELETE FROM event_attendees WHERE eventId=? AND userId=?', [
        id,
        req.user!.id,
      ]);
    await c.commit();
    res.json({ joined });
  } catch (error) {
    await c.rollback();
    throw error;
  } finally {
    c.release();
  }
});
