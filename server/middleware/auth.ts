import { createHash } from 'node:crypto';
import type { RequestHandler } from 'express';
import type { User } from '../../shared/types';
import { prisma } from '../db/client';
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
export const tokenHash = (token: string) => createHash('sha256').update(token).digest('hex');
export const identify: RequestHandler = async (req, _res, next) => {
  if (typeof req.cookies.session === 'string') {
    const session = await prisma.session.findFirst({
      where: { tokenHash: tokenHash(req.cookies.session), expiresAt: { gt: new Date() } },
      select: {
        users: {
          select: { id: true, name: true, email: true, role: true, color: true, bio: true },
        },
      },
    });
    req.user = session?.users;
  }
  next();
};
export const authenticated: RequestHandler = (req, res, next) => {
  if (!req.user) {
    res.status(401).json({ message: '请先登录，继续记录你的故事' });
    return;
  }
  next();
};
export const adminOnly: RequestHandler = (req, res, next) => {
  if (!req.user || req.user.role === 'member') {
    res.status(403).json({ message: '需要管理员权限' });
    return;
  }
  next();
};
export const superOnly: RequestHandler = (req, res, next) => {
  if (req.user?.role !== 'superadmin') {
    res.status(403).json({ message: '需要超级管理员权限' });
    return;
  }
  next();
};
