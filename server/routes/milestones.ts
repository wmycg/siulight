import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { milestoneSchema, dateSchema } from '../../shared/validation';
import { authenticated } from '../middleware/auth';
import { prisma } from '../db/client';
import { listMilestones, saveMilestone } from '../services/milestones';
import { memoryChapters, memoryTimeline } from '../services/memory-timeline';
import { audit } from '../services/audit';
export const milestoneRouter = Router();
const filters = z.object({
  kind: z.enum(['personal', 'club']).optional(),
  author: z.string().uuid().optional(),
  q: z.string().max(100).optional(),
  year: z
    .string()
    .regex(/^(\d{4})?$/)
    .optional(),
  month: z
    .string()
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/)
    .optional(),
  date: dateSchema.optional(),
  eventId: z.string().uuid().optional(),
  unlinked: z
    .literal('true')
    .optional()
    .transform((v) => v === 'true'),
  page: z
    .string()
    .regex(/^[1-9]\d{0,3}$/)
    .optional(),
});
milestoneRouter.get('/', async (req, res) =>
  res.json(await listMilestones(filters.parse(req.query), req.user?.id)),
);
milestoneRouter.get('/chapters', async (req, res) =>
  res.json(await memoryChapters(filters.parse(req.query))),
);
milestoneRouter.get('/timeline', async (req, res) => {
  const query = filters
    .extend({ month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/) })
    .parse(req.query);
  res.json(await memoryTimeline(query, req.user?.id));
});
milestoneRouter.get('/years', async (_req, res) =>
  res.json(
    await prisma.$queryRawUnsafe<{ year: number }[]>(
      'SELECT DISTINCT YEAR(date) year FROM milestones ORDER BY year DESC',
    ),
  ),
);
milestoneRouter.post('/', authenticated, async (req, res) => {
  const data = milestoneSchema.parse(req.body);
  if (data.kind === 'club' && req.user!.role === 'member') {
    res.status(403).json({ message: '社团纪念由管理员发布，你可以发布个人纪念并邀请伙伴署名' });
    return;
  }
  const id = randomUUID();
  await saveMilestone(id, req.user!.id, data, false);
  res.status(201).json({ id });
});
milestoneRouter.put('/:id', authenticated, async (req, res) => {
  const id = z.string().uuid().parse(req.params.id);
  const data = milestoneSchema.parse(req.body);
  const item = await prisma.milestone.findUnique({
    where: { id },
    select: { authorId: true, kind: true },
  });
  if (!item) {
    res.status(404).json({ message: '这条纪念已不存在' });
    return;
  }
  if (item.authorId !== req.user!.id || (data.kind === 'club' && req.user!.role === 'member')) {
    res.status(403).json({ message: '只有作者可以编辑自己的纪念' });
    return;
  }
  await saveMilestone(id, item.authorId, data, true);
  res.json({ id });
});
milestoneRouter.delete('/:id', authenticated, async (req, res) => {
  const id = z.string().uuid().parse(req.params.id);
  const item = await prisma.milestone.findUnique({
    where: { id },
    select: { authorId: true },
  });
  if (!item) {
    res.status(404).json({ message: '这条纪念已不存在' });
    return;
  }
  if (item.authorId !== req.user!.id && req.user!.role === 'member') {
    res.status(403).json({ message: '只能删除自己的纪念' });
    return;
  }
  await prisma.milestone.delete({ where: { id } });
  if (req.user!.role !== 'member') await audit(req.user!.name, `移除里程碑 ${id}`);
  res.json({ ok: true });
});
milestoneRouter.put('/:id/like', authenticated, async (req, res) => {
  const id = z.string().uuid().parse(req.params.id);
  const { liked } = z.object({ liked: z.boolean() }).parse(req.body);
  const item = await prisma.milestone.findUnique({ where: { id }, select: { id: true } });
  if (!item) {
    res.status(404).json({ message: '这条纪念已不存在' });
    return;
  }
  if (liked)
    await prisma.like.upsert({
      where: { milestoneId_userId: { milestoneId: id, userId: req.user!.id } },
      create: { milestoneId: id, userId: req.user!.id },
      update: {},
    });
  else await prisma.like.deleteMany({ where: { milestoneId: id, userId: req.user!.id } });
  res.json({ liked });
});
