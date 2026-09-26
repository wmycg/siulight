import { Router } from 'express';
import { randomBytes, randomUUID } from 'node:crypto';
import { rateLimit } from 'express-rate-limit';
import { registerSchema, loginSchema, passwordSchema } from '../../shared/validation';
import { prisma } from '../db/client';
import { hashPassword, verifyPassword } from '../services/password';
import { authenticated, tokenHash } from '../middleware/auth';
import { config } from '../config';
import { audit } from '../services/audit';
export const authRouter = Router();
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { message: '尝试次数较多，请稍后再试' },
});
const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: config.production,
  path: '/',
};
async function session(userId: string, oldToken?: string) {
  if (oldToken) await prisma.session.deleteMany({ where: { tokenHash: tokenHash(oldToken) } });
  await prisma.session.deleteMany({ where: { expiresAt: { lte: new Date() } } });
  const token = randomBytes(32).toString('hex');
  await prisma.session.create({
    data: {
      tokenHash: tokenHash(token),
      userId,
      expiresAt: new Date(Date.now() + 14 * 86400000),
    },
  });
  return token;
}
authRouter.get('/me', (req, res) => res.json(req.user || null));
authRouter.post('/register', limiter, async (req, res) => {
  const data = registerSchema.parse(req.body);
  const id = randomUUID();
  await prisma.user.create({
    data: {
      id,
      email: data.email,
      name: data.name,
      passwordHash: await hashPassword(data.password),
    },
  });
  res.cookie('session', await session(id, req.cookies.session), {
    ...cookieOptions,
    maxAge: 14 * 86400000,
  });
  res
    .status(201)
    .json({ id, email: data.email, name: data.name, role: 'member', color: '#c16b51', bio: '' });
});
authRouter.post('/login', limiter, async (req, res) => {
  const data = loginSchema.parse(req.body);
  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user || !(await verifyPassword(data.password, user.passwordHash))) {
    res.status(401).json({ message: '邮箱或密码不正确' });
    return;
  }
  res.cookie('session', await session(user.id, req.cookies.session), {
    ...cookieOptions,
    maxAge: 14 * 86400000,
  });
  if (user.role !== 'member') await audit(user.name, '登录管理后台');
  const { passwordHash: _, ...safe } = user;
  res.json(safe);
});
authRouter.post('/logout', async (req, res) => {
  if (req.cookies.session)
    await prisma.session.deleteMany({ where: { tokenHash: tokenHash(req.cookies.session) } });
  res.clearCookie('session', cookieOptions).json({ ok: true });
});
authRouter.post('/password', authenticated, limiter, async (req, res) => {
  const data = passwordSchema.parse(req.body);
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: { passwordHash: true },
  });
  if (!user) {
    res.status(401).json({ message: '登录状态已失效，请重新登录' });
    return;
  }
  if (!(await verifyPassword(data.currentPassword, user.passwordHash))) {
    res.status(400).json({ message: '当前密码不正确' });
    return;
  }
  await prisma.user.update({
    where: { id: req.user!.id },
    data: { passwordHash: await hashPassword(data.newPassword) },
  });
  await prisma.session.deleteMany({ where: { userId: req.user!.id } });
  res
    .cookie('session', await session(req.user!.id), { ...cookieOptions, maxAge: 14 * 86400000 })
    .json({ ok: true });
});
