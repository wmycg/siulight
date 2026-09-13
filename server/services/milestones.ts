import { rows, pool, type SqlValue } from '../db/client';
import type { Member, Milestone, Page } from '../../shared/types';
import type { z } from 'zod';
import type { milestoneSchema } from '../../shared/validation';
import type { RowDataPacket } from 'mysql2/promise';
export interface MilestoneQuery {
  kind?: string;
  author?: string;
  q?: string;
  year?: string;
  page?: string;
  month?: string;
  date?: string;
  eventId?: string;
  unlinked?: boolean;
}
export function milestoneFilter(query: MilestoneQuery) {
  const where: string[] = [];
  const args: SqlValue[] = [];
  if (query.kind === 'club' || query.kind === 'personal') {
    where.push('m.kind=?');
    args.push(query.kind);
  }
  if (query.author) {
    where.push(
      '(m.authorId=? OR EXISTS (SELECT 1 FROM milestone_participants mp WHERE mp.milestoneId=m.id AND mp.userId=?))',
    );
    args.push(query.author, query.author);
  }
  if (query.year && /^\d{4}$/.test(query.year)) {
    where.push('m.date >= ? AND m.date < ?');
    args.push(`${query.year}-01-01`, `${Number(query.year) + 1}-01-01`);
  }
  if (query.month) {
    where.push('m.date >= ? AND m.date < DATE_ADD(?, INTERVAL 1 MONTH)');
    args.push(`${query.month}-01`, `${query.month}-01`);
  }
  if (query.date) {
    where.push('m.date=?');
    args.push(query.date);
  }
  if (query.eventId) {
    where.push('m.eventId=?');
    args.push(query.eventId);
  }
  if (query.unlinked) where.push('m.eventId IS NULL');
  if (query.q) {
    where.push(
      '(m.title LIKE ? OR m.body LIKE ? OR EXISTS (SELECT 1 FROM users su WHERE su.id=m.authorId AND su.name LIKE ?))',
    );
    args.push(...Array(3).fill(`%${query.q.slice(0, 100)}%`));
  }
  return { clause: where.length ? `WHERE ${where.join(' AND ')}` : '', args };
}
export async function listMilestones(
  query: MilestoneQuery,
  viewer = '',
  limit = 12,
): Promise<Page<Milestone>> {
  const page = Math.max(1, Math.min(10000, Number(query.page) || 1));
  const { clause, args } = milestoneFilter(query);
  const [count] = await rows<{ total: number }>(
    `SELECT COUNT(*) total FROM milestones m ${clause}`,
    args,
  );
  const items = await rows<
    Milestone & { authorName: string; authorColor: string; authorBio: string }
  >(
    `SELECT m.*,u.name authorName,u.color authorColor,u.bio authorBio,(SELECT COUNT(*) FROM likes l WHERE l.milestoneId=m.id) likes,EXISTS(SELECT 1 FROM likes l WHERE l.milestoneId=m.id AND l.userId=?) liked FROM milestones m JOIN users u ON u.id=m.authorId ${clause} ORDER BY m.date DESC,m.createdAt DESC,m.id DESC LIMIT ${limit} OFFSET ${(page - 1) * limit}`,
    [viewer, ...args],
  );
  let people: (Member & { milestoneId: string })[] = [];
  if (items.length)
    people = await rows<Member & { milestoneId: string }>(
      `SELECT p.milestoneId,u.id,u.name,u.color,u.bio FROM milestone_participants p JOIN users u ON u.id=p.userId WHERE p.milestoneId IN (${items.map(() => '?').join(',')}) ORDER BY u.name`,
      items.map((i) => i.id),
    );
  return {
    items: items.map(({ authorName, authorColor, authorBio, ...m }) => ({
      ...m,
      liked: Boolean(m.liked),
      author: { id: m.authorId, name: authorName, color: authorColor, bio: authorBio },
      participants: people
        .filter((p) => p.milestoneId === m.id)
        .map(({ milestoneId: _, ...person }) => person),
    })),
    total: count.total,
    page,
    pages: Math.ceil(count.total / limit),
  };
}
export async function saveMilestone(
  id: string,
  authorId: string,
  data: z.infer<typeof milestoneSchema>,
  update: boolean,
) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    if (data.eventId) {
      const [events] = await connection.execute<RowDataPacket[]>(
        'SELECT id FROM events WHERE id=? FOR SHARE',
        [data.eventId],
      );
      if (!events.length)
        throw Object.assign(new Error('关联的活动已不存在，请重新选择'), { status: 400 });
    }
    const participants = [...new Set([authorId, ...data.participantIds])];
    const [people] = await connection.execute<RowDataPacket[]>(
      `SELECT id FROM users WHERE id IN (${participants.map(() => '?').join(',')})`,
      participants,
    );
    if (people.length !== participants.length)
      throw Object.assign(new Error('部分参与者已不存在，请重新选择'), { status: 400 });
    if (update) {
      await connection.execute(
        'UPDATE milestones SET title=?,body=?,date=?,kind=?,category=?,image=?,eventId=? WHERE id=?',
        [
          data.title,
          data.body,
          data.date,
          data.kind,
          data.category,
          data.image,
          data.eventId || null,
          id,
        ],
      );
      await connection.execute('DELETE FROM milestone_participants WHERE milestoneId=?', [id]);
    } else
      await connection.execute(
        'INSERT INTO milestones (id,authorId,title,body,date,kind,category,image,eventId) VALUES (?,?,?,?,?,?,?,?,?)',
        [
          id,
          authorId,
          data.title,
          data.body,
          data.date,
          data.kind,
          data.category,
          data.image,
          data.eventId || null,
        ],
      );
    for (const person of participants)
      await connection.execute(
        'INSERT INTO milestone_participants (milestoneId,userId) VALUES (?,?)',
        [id, person],
      );
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
