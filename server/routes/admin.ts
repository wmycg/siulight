import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { adminOnly, superOnly } from '../middleware/auth';
import { rows, run } from '../db/client';
import { eventSchema, registerSchema } from '../../shared/validation';
import { audit } from '../services/audit';
import { hashPassword } from '../services/password';
import { updateEvent } from '../services/events';
export const adminRouter = Router();
adminRouter.use(adminOnly);
adminRouter.get('/applications', async (_req, res) =>
  res.json(await rows('SELECT * FROM applications ORDER BY createdAt DESC LIMIT 1000')),
);
adminRouter.patch('/applications/:id', async (req, res) => {
  const id = z.string().uuid().parse(req.params.id);
  const { status } = z
    .object({ status: z.enum(['pending', 'contacted', 'accepted']) })
    .parse(req.body);
  const result = await run('UPDATE applications SET status=? WHERE id=?', [status, id]);
  if (!result.affectedRows) {
    res.status(404).json({ message: '申请不存在' });
    return;
  }
  await audit(req.user!.name, `入社申请 ${id} → ${status}`);
  res.json({ ok: true });
});
adminRouter.get('/logs', async (_req, res) =>
  res.json(await rows('SELECT * FROM audit_logs ORDER BY id DESC LIMIT 200')),
);
const wallQuery = z.object({
  q: z.string().trim().max(100).optional(),
  page: z.string().regex(/^[1-9]\d{0,3}$/).optional(),
});
const wallId = z.coerce.number().int().positive().max(2147483647);
adminRouter.get('/wall', async (req, res) => {
  const query = wallQuery.parse(req.query);
  const page = Math.max(1, Math.min(10000, Number(query.page) || 1));
  const limit = 30;
  const keyword = query.q || '';
  const where = keyword ? 'WHERE body LIKE ? OR nickname LIKE ?' : '';
  const values = keyword ? [`%${keyword}%`, `%${keyword}%`] : [];
  const [count] = await rows<{ total: number }>(
    `SELECT COUNT(*) total FROM wall_notes ${where}`,
    values,
  );
  const items = await rows<{
    id: number;
    body: string;
    nickname: string;
    color: string;
    isDemo: boolean | number;
    registered: boolean | number;
    createdAt: string;
  }>(
    `SELECT id,body,nickname,color,isDemo,(userId IS NOT NULL) registered,createdAt FROM wall_notes ${where} ORDER BY id DESC LIMIT ${limit} OFFSET ${(page - 1) * limit}`,
    values,
  );
  res.json({
    items: items.map((item) => ({ ...item, isDemo: Boolean(item.isDemo), registered: Boolean(item.registered) })),
    total: count.total,
    page,
    pages: Math.ceil(count.total / limit),
  });
});
adminRouter.delete('/wall/:id', async (req, res) => {
  const id = wallId.parse(req.params.id);
  const result = await run('DELETE FROM wall_notes WHERE id=?', [id]);
  if (!result.affectedRows) {
    res.status(404).json({ message: '这张纸条已经被收走了' });
    return;
  }
  await audit(req.user!.name, `删除留言墙纸条 ${id}`);
  res.json({ ok: true });
});
adminRouter.get('/users', superOnly, async (_req, res) =>
  res.json(
    await rows('SELECT id,name,email,role,color,bio FROM users ORDER BY createdAt DESC LIMIT 1000'),
  ),
);
adminRouter.post('/users', superOnly, async (req, res) => {
  const data = registerSchema.extend({ role: z.enum(['admin', 'superadmin']) }).parse(req.body);
  const id = randomUUID();
  await run('INSERT INTO users (id,name,email,passwordHash,role) VALUES (?,?,?,?,?)', [
    id,
    data.name,
    data.email,
    await hashPassword(data.password),
    data.role,
  ]);
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
  const result = await run("UPDATE users SET role=? WHERE id=? AND role != 'superadmin'", [
    role,
    id,
  ]);
  if (!result.affectedRows) {
    res.status(400).json({ message: '不能修改此账号' });
    return;
  }
  await run('DELETE FROM sessions WHERE userId=?', [id]);
  await audit(req.user!.name, `成员 ${id} 权限 → ${role}`);
  res.json({ ok: true });
});
adminRouter.delete('/users/:id', superOnly, async (req, res) => {
  const id = z.string().uuid().parse(req.params.id);
  if (id === req.user!.id) {
    res.status(400).json({ message: '不能删除自己的账号' });
    return;
  }
  const [user] = await rows<{ role: string; name: string }>(
    'SELECT role,name FROM users WHERE id=?',
    [id],
  );
  if (!user || user.role === 'superadmin') {
    res.status(400).json({ message: '不能删除此账号' });
    return;
  }
  const [count] = await rows<{ total: number }>(
    'SELECT COUNT(*) total FROM milestones WHERE authorId=?',
    [id],
  );
  if (count.total) {
    res.status(409).json({ message: '该成员有公开纪念，请先处理内容；也可以仅撤销管理权限' });
    return;
  }
  await run('DELETE FROM users WHERE id=?', [id]);
  await audit(req.user!.name, `删除账号 ${user.name}`);
  res.json({ ok: true });
});
adminRouter.post('/events', async (req, res) => {
  const d = eventSchema.parse(req.body);
  const id = randomUUID();
  await run(
    'INSERT INTO events (id,title,date,place,brief,body,image,category,capacity) VALUES (?,?,?,?,?,?,?,?,?)',
    [id, d.title, d.date, d.place, d.brief, d.body, d.image, d.category, d.capacity],
  );
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
  await run('DELETE FROM events WHERE id=?', [id]);
  await audit(req.user!.name, `删除活动 ${id}`);
  res.json({ ok: true });
});
