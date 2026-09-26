import { randomBytes } from 'node:crypto';
import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { z } from 'zod';
import { prisma } from '../db/client';
import { tokenHash } from '../middleware/auth';
import { config } from '../config';
import { wallNoteSchema } from '../../shared/validation';
import type { WallNote } from '../../shared/types';
import type { Request } from 'express';

export const wallRouter = Router();
const guestCookie = 'siulight_wall_guest';
const guestToken = (req: Request) => {
  const value = req.cookies[guestCookie];
  return typeof value === 'string' && /^[a-f0-9]{64}$/.test(value) ? value : null;
};
type StoredNote = {
  id: number;
  body: string;
  nickname: string;
  color: string;
  isDemo: boolean;
  userId: string | null;
  guestHash: string | null;
  createdAt: string | Date;
};
function present(note: StoredNote, req: Request): WallNote {
  const { userId, guestHash, ...publicNote } = note;
  const guest = guestToken(req);
  const createdAt =
    note.createdAt instanceof Date
      ? note.createdAt.toISOString()
      : `${note.createdAt.replace(' ', 'T')}Z`;
  return {
    ...publicNote,
    color: note.color as WallNote['color'],
    isDemo: Boolean(note.isDemo),
    registered: Boolean(userId),
    createdAt,
    canDelete: Boolean(
      (req.user && (req.user.id === userId || req.user.role !== 'member')) ||
      (guestHash && guest && tokenHash(guest) === guestHash),
    ),
  };
}
const idSchema = z.coerce.number().int().positive().max(2147483647);
wallRouter.get('/', async (req, res) => {
  const cursor = req.query.cursor === undefined ? null : idSchema.parse(req.query.cursor);
  const items = await prisma.wallNote.findMany({
    where: cursor ? { id: { lt: cursor } } : undefined,
    orderBy: { id: 'desc' },
    take: 61,
  });
  const page = items.slice(0, 60);
  res.json({
    items: page.map((note) => present(note, req)),
    nextCursor: items.length > 60 ? page.at(-1)!.id : null,
  });
});
wallRouter.post(
  '/',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { message: '纸条写得有点快，歇一会儿再来吧。' },
  }),
  async (req, res) => {
    const data = wallNoteSchema.parse(req.body);
    let guest = guestToken(req);
    if (!req.user && !guest) {
      guest = randomBytes(32).toString('hex');
      res.cookie(guestCookie, guest, {
        httpOnly: true,
        secure: config.production,
        sameSite: 'lax',
        path: '/',
        maxAge: 365 * 24 * 60 * 60 * 1000,
      });
      req.cookies[guestCookie] = guest;
    }
    const note = await prisma.wallNote.create({
      data: {
        body: data.body,
        nickname: req.user?.name || data.nickname || '路过的同好',
        color: data.color,
        userId: req.user?.id || null,
        guestHash: !req.user && guest ? tokenHash(guest) : null,
      },
    });
    res.status(201).json(present(note, req));
  },
);
wallRouter.delete('/:id', async (req, res) => {
  const id = idSchema.parse(req.params.id);
  const note = await prisma.wallNote.findUnique({ where: { id } });
  if (!note) {
    res.status(404).json({ message: '这张纸条已经被收走了' });
    return;
  }
  if (!present(note, req).canDelete) {
    res.status(403).json({ message: '只能收回自己的纸条' });
    return;
  }
  await prisma.wallNote.delete({ where: { id } });
  res.json({ ok: true });
});
