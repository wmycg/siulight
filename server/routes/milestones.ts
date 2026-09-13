import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { milestoneSchema } from '../../shared/validation';
import { authenticated } from '../middleware/auth';
import { rows, run } from '../db/client';
import { listMilestones, saveMilestone } from '../services/milestones';
import { audit } from '../services/audit';
export const milestoneRouter = Router();
milestoneRouter.get('/', async (req, res) =>
  res.json(
    await listMilestones(
      z
        .object({
          kind: z.enum(['personal', 'club']).optional(),
          author: z.string().uuid().optional(),
          q: z.string().max(100).optional(),
          year: z
            .string()
            .regex(/^(\d{4})?$/)
            .optional(),
          page: z
            .string()
            .regex(/^[1-9]\d{0,3}$/)
            .optional(),
        })
        .parse(req.query),
      req.user?.id,
    ),
  ),
);
milestoneRouter.get('/years', async (_req, res) =>
  res.json(await rows('SELECT DISTINCT YEAR(date) year FROM milestones ORDER BY year DESC')),
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
  const [item] = await rows<{ authorId: string; kind: string }>(
    'SELECT authorId,kind FROM milestones WHERE id=?',
    [id],
  );
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
  const [item] = await rows<{ authorId: string }>('SELECT authorId FROM milestones WHERE id=?', [
    id,
  ]);
  if (!item) {
    res.status(404).json({ message: '这条纪念已不存在' });
    return;
  }
  if (item.authorId !== req.user!.id && req.user!.role === 'member') {
    res.status(403).json({ message: '只能删除自己的纪念' });
    return;
  }
  await run('DELETE FROM milestones WHERE id=?', [id]);
  if (req.user!.role !== 'member') await audit(req.user!.name, `移除里程碑 ${id}`);
  res.json({ ok: true });
});
milestoneRouter.put('/:id/like', authenticated, async (req, res) => {
  const id = z.string().uuid().parse(req.params.id);
  const { liked } = z.object({ liked: z.boolean() }).parse(req.body);
  const [item] = await rows('SELECT id FROM milestones WHERE id=?', [id]);
  if (!item) {
    res.status(404).json({ message: '这条纪念已不存在' });
    return;
  }
  if (liked)
    await run('INSERT IGNORE INTO likes (milestoneId,userId) VALUES (?,?)', [id, req.user!.id]);
  else await run('DELETE FROM likes WHERE milestoneId=? AND userId=?', [id, req.user!.id]);
  res.json({ liked });
});
