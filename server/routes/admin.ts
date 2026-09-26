import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { adminOnly, superOnly } from '../middleware/auth';
import { prisma, toDatabaseDate } from '../db/client';
import { eventSchema, registerSchema } from '../../shared/validation';
import { audit } from '../services/audit';
import { hashPassword } from '../services/password';
import { updateEvent } from '../services/events';
export const adminRouter = Router();
adminRouter.use(adminOnly);
const pageQuery = z.object({
  page: z.coerce.number().int().min(1).max(10000).default(1),
  q: z.string().trim().max(100).default(''),
  status: z.enum(['all', 'pending', 'contacted', 'accepted']).default('all'),
});
const adminPageSize = 30;
adminRouter.get('/applications', async (req, res) => {
  const query = pageQuery.parse(req.query);
  const where = {
    ...(query.q
      ? {
          OR: [
            { nickname: { contains: query.q } },
            { realName: { contains: query.q } },
            { studentId: { contains: query.q } },
            { qq: { contains: query.q } },
          ],
        }
      : {}),
    ...(query.status !== 'all' ? { status: query.status } : {}),
  };
  const [total, items] = await Promise.all([
    prisma.application.count({ where }),
    prisma.application.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: adminPageSize,
      skip: (query.page - 1) * adminPageSize,
    }),
  ]);
  res.json({
    items,
    total,
    page: query.page,
    pages: Math.ceil(total / adminPageSize),
  });
});
adminRouter.patch('/applications/:id', async (req, res) => {
  const id = z.string().uuid().parse(req.params.id);
  const { status } = z
    .object({ status: z.enum(['pending', 'contacted', 'accepted']) })
    .parse(req.body);
  const result = await prisma.application.updateMany({ where: { id }, data: { status } });
  if (!result.count) {
    res.status(404).json({ message: '申请不存在' });
    return;
  }
  await audit(req.user!.name, `入社申请 ${id} → ${status}`);
  res.json({ ok: true });
});
adminRouter.get('/logs', async (req, res) => {
  const { page } = pageQuery.parse(req.query);
  const [total, items] = await Promise.all([
    prisma.auditLog.count(),
    prisma.auditLog.findMany({
      orderBy: { id: 'desc' },
      take: adminPageSize,
      skip: (page - 1) * adminPageSize,
    }),
  ]);
  res.json({ items, total, page, pages: Math.ceil(total / adminPageSize) });
});
const wallQuery = z.object({
  q: z.string().trim().max(100).optional(),
  page: z
    .string()
    .regex(/^[1-9]\d{0,3}$/)
    .optional(),
});
const wallId = z.coerce.number().int().positive().max(2147483647);
adminRouter.get('/wall', async (req, res) => {
  const query = wallQuery.parse(req.query);
  const page = Math.max(1, Math.min(10000, Number(query.page) || 1));
  const limit = 30;
  const keyword = query.q || '';
  const where = keyword
    ? { OR: [{ body: { contains: keyword } }, { nickname: { contains: keyword } }] }
    : {};
  const [total, items] = await Promise.all([
    prisma.wallNote.count({ where }),
    prisma.wallNote.findMany({
      where,
      select: {
        id: true,
        body: true,
        nickname: true,
        color: true,
        isDemo: true,
        userId: true,
        createdAt: true,
      },
      orderBy: { id: 'desc' },
      take: limit,
      skip: (page - 1) * limit,
    }),
  ]);
  res.json({
    items: items.map(({ userId, ...item }) => ({
      ...item,
      registered: Boolean(userId),
      createdAt: item.createdAt.toISOString(),
    })),
    total,
    page,
    pages: Math.ceil(total / limit),
  });
});
adminRouter.delete('/wall/:id', async (req, res) => {
  const id = wallId.parse(req.params.id);
  const result = await prisma.wallNote.deleteMany({ where: { id } });
  if (!result.count) {
    res.status(404).json({ message: '这张纸条已经被收走了' });
    return;
  }
  await audit(req.user!.name, `删除留言墙纸条 ${id}`);
  res.json({ ok: true });
});
adminRouter.get('/users', superOnly, async (req, res) => {
  const { page } = pageQuery.parse(req.query);
  const [total, items] = await Promise.all([
    prisma.user.count(),
    prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, color: true, bio: true },
      orderBy: { createdAt: 'desc' },
      take: adminPageSize,
      skip: (page - 1) * adminPageSize,
    }),
  ]);
  res.json({ items, total, page, pages: Math.ceil(total / adminPageSize) });
});
adminRouter.post('/users', superOnly, async (req, res) => {
  const data = registerSchema.extend({ role: z.enum(['admin', 'superadmin']) }).parse(req.body);
  const id = randomUUID();
  await prisma.user.create({
    data: {
      id,
      name: data.name,
      email: data.email,
      passwordHash: await hashPassword(data.password),
      role: data.role,
    },
  });
  await audit(req.user!.name, `创建管理员 ${data.name}`);
  res.status(201).json({ id });
});
adminRouter.patch('/users/:id', superOnly, async (req, res) => {
  const id = z.string().uuid().parse(req.params.id);
  const { role } = z.object({ role: z.enum(['member', 'admin']) }).parse(req.body);
  if (id === req.user!.id) {
    res.status(400).json({ message: '不能修改自己的权限' });
    return;
  }
  const result = await prisma.user.updateMany({
    where: { id, role: { not: 'superadmin' } },
    data: { role },
  });
  if (!result.count) {
    res.status(400).json({ message: '不能修改此账号' });
    return;
  }
  await prisma.session.deleteMany({ where: { userId: id } });
  await audit(req.user!.name, `成员 ${id} 权限 → ${role}`);
  res.json({ ok: true });
});
adminRouter.delete('/users/:id', superOnly, async (req, res) => {
  const id = z.string().uuid().parse(req.params.id);
  if (id === req.user!.id) {
    res.status(400).json({ message: '不能删除自己的账号' });
    return;
  }
  const user = await prisma.user.findUnique({
    where: { id },
    select: { role: true, name: true },
  });
  if (!user || user.role === 'superadmin') {
    res.status(400).json({ message: '不能删除此账号' });
    return;
  }
  const count = await prisma.milestone.count({ where: { authorId: id } });
  if (count) {
    res.status(409).json({ message: '该成员有公开纪念，请先处理内容；也可以仅撤销管理权限' });
    return;
  }
  await prisma.user.delete({ where: { id } });
  await audit(req.user!.name, `删除账号 ${user.name}`);
  res.json({ ok: true });
});
adminRouter.post('/events', async (req, res) => {
  const d = eventSchema.parse(req.body);
  const id = randomUUID();
  await prisma.event.create({
    data: {
      id,
      title: d.title,
      date: toDatabaseDate(d.date),
      place: d.place,
      brief: d.brief,
      body: d.body,
      image: d.image,
      category: d.category,
      capacity: d.capacity,
    },
  });
  await audit(req.user!.name, `发布活动：${d.title}`);
  res.status(201).json({ id });
});
adminRouter.put('/events/:id', async (req, res) => {
  const id = z.string().uuid().parse(req.params.id);
  const d = eventSchema.parse(req.body);
  await updateEvent(id, d);
  await audit(req.user!.name, `编辑活动：${d.title}`);
  res.json({ id });
});
adminRouter.delete('/events/:id', async (req, res) => {
  const id = z.string().uuid().parse(req.params.id);
  await prisma.event.delete({ where: { id } });
  await audit(req.user!.name, `删除活动 ${id}`);
  res.json({ ok: true });
});
