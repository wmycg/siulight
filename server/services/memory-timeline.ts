import { rows } from '../db/client';
import { milestoneFilter, listMilestones, type MilestoneQuery } from './milestones';
import type { MemoryChapter, MemoryGroup, Page } from '../../shared/types';

export async function memoryChapters(query: MilestoneQuery): Promise<MemoryChapter[]> {
  const { clause, args } = milestoneFilter(query);
  return rows<MemoryChapter>(
    `SELECT DATE_FORMAT(m.date,'%Y-%m') month, COUNT(DISTINCT m.id) count,
    COUNT(DISTINCT mp.userId) people, COALESCE(MAX(NULLIF(m.image,'')), '') cover
    FROM milestones m LEFT JOIN milestone_participants mp ON mp.milestoneId=m.id ${clause}
    GROUP BY month ORDER BY month DESC`,
    args,
  );
}
export async function memoryTimeline(
  query: MilestoneQuery,
  viewer = '',
): Promise<Page<MemoryGroup>> {
  const { clause, args } = milestoneFilter(query);
  const page = Number(query.page || 1),
    limit = 8;
  const groupKey = "IF(m.eventId IS NULL, CONCAT('day:',m.date), CONCAT('event:',m.eventId))";
  const [total] = await rows<{ total: number }>(
    `SELECT COUNT(DISTINCT ${groupKey}) total FROM milestones m ${clause}`,
    args,
  );
  const groups = await rows<Omit<MemoryGroup, 'type' | 'preview'>>(
    `SELECT ${groupKey} AS \`key\`, m.eventId,
    MAX(m.date) date, COALESCE(MAX(e.title),'') title, COALESCE(MAX(NULLIF(e.image,'')),MAX(NULLIF(m.image,'')),'') cover,
    COUNT(DISTINCT m.id) count, COUNT(DISTINCT mp.userId) people
    FROM milestones m LEFT JOIN events e ON e.id=m.eventId LEFT JOIN milestone_participants mp ON mp.milestoneId=m.id ${clause}
    GROUP BY \`key\`, m.eventId ORDER BY date DESC, \`key\` DESC LIMIT ${limit} OFFSET ${(page - 1) * limit}`,
    args,
  );
  const items = await Promise.all(
    groups.map(async (g) => {
      const preview = await listMilestones(
        {
          ...query,
          page: '1',
          ...(g.eventId ? { eventId: g.eventId } : { date: g.date, unlinked: true }),
        },
        viewer,
        3,
      );
      return {
        ...g,
        type: g.eventId ? ('event' as const) : ('day' as const),
        preview: preview.items,
      };
    }),
  );
  return { items, total: total.total, page, pages: Math.ceil(total.total / limit) };
}
