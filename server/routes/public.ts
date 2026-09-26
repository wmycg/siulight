import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { rateLimit } from 'express-rate-limit';
import { applicationSchema } from '../../shared/validation';
import { prisma } from '../db/client';
export const publicRouter = Router();
publicRouter.get('/health', async (_req, res) => {
  await prisma.$queryRawUnsafe('SELECT 1');
  res.json({ status: 'ok', database: 'mysql' });
});
publicRouter.get('/stats', async (_req, res) => {
  const [members, milestones, events] = await Promise.all([
    prisma.user.count(),
    prisma.milestone.count(),
    prisma.event.count(),
  ]);
  res.json({ members, milestones, events });
});
publicRouter.get('/members', async (req, res) => {
  const q = String(req.query.q || '').slice(0, 40);
  res.json(
    await prisma.user.findMany({
      where: { name: { contains: q } },
      select: { id: true, name: true, color: true, bio: true },
      orderBy: { name: 'asc' },
      take: 100,
    }),
  );
});
publicRouter.get('/members/:id', async (req, res) => {
  const id = z.string().uuid().parse(req.params.id);
  const member = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, color: true, bio: true },
  });
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
    const existing = await prisma.application.findUnique({
      where: { studentId: d.studentId },
      select: { id: true },
    });
    if (existing) {
      res.status(409).json({ message: '该学号已提交申请，请等待社团通过 QQ 联系你' });
      return;
    }
    await prisma.application.create({
      data: {
        id,
        nickname: d.nickname,
        realName: d.realName,
        studentId: d.studentId,
        qq: d.qq,
        department: d.department,
        note: d.note,
      },
    });
    res.status(201).json({ id });
  },
);
