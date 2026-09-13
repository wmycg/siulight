import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { rateLimit } from 'express-rate-limit';
import { applicationSchema } from '../../shared/validation';
import { rows, run } from '../db/client';
export const publicRouter = Router();
publicRouter.get('/health', async (_req, res) => {
  await rows('SELECT 1');
  res.json({ status: 'ok', database: 'mysql' });
});
publicRouter.get('/stats', async (_req, res) => {
  const [stats] = await rows(
    'SELECT (SELECT COUNT(*) FROM users) members,(SELECT COUNT(*) FROM milestones) milestones,(SELECT COUNT(*) FROM events) events',
  );
  res.json(stats);
});
publicRouter.get('/members', async (req, res) => {
  const q = String(req.query.q || '').slice(0, 40);
  res.json(
    await rows('SELECT id,name,color,bio FROM users WHERE name LIKE ? ORDER BY name LIMIT 100', [
      `%${q}%`,
    ]),
  );
});
publicRouter.get('/members/:id', async (req, res) => {
  const id = z.string().uuid().parse(req.params.id);
  const [member] = await rows('SELECT id,name,color,bio FROM users WHERE id=?', [id]);
  if (!member) {
    res.status(404).json({ message: '没有找到这位成员' });
    return;
  }
  res.json(member);
});
publicRouter.post(
  '/applications',
  rateLimit({ windowMs: 3600000, limit: 10, message: { message: '提交较频繁，请稍后再试' } }),
  async (req, res) => {
    const d = applicationSchema.parse(req.body);
    const id = randomUUID();
    const [existing] = await rows('SELECT id FROM applications WHERE studentId=?', [d.studentId]);
    if (existing) {
      res.status(409).json({ message: '该学号已提交申请，请等待社团通过 QQ 联系你' });
      return;
    }
    await run(
      'INSERT INTO applications (id,nickname,realName,studentId,qq,department,note) VALUES (?,?,?,?,?,?,?)',
      [id, d.nickname, d.realName, d.studentId, d.qq, d.department, d.note],
    );
    res.status(201).json({ id });
  },
);
