import { createHash } from 'node:crypto';
import type { RequestHandler } from 'express';
import type { User } from '../../shared/types';
import { rows } from '../db/client';
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
    const [user] = await rows<User>(
      'SELECT u.id,u.name,u.email,u.role,u.color,u.bio FROM users u JOIN sessions s ON s.userId=u.id WHERE s.tokenHash=? AND s.expiresAt > UTC_TIMESTAMP()',
      [tokenHash(req.cookies.session)],
    );
    req.user = user;
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
