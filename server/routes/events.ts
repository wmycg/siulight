import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db/client';
import { authenticated } from '../middleware/auth';
export const eventRouter = Router();
eventRouter.get('/', async (req, res) => {
  const events = await prisma.event.findMany({
    orderBy: { date: 'desc' },
    take: 200,
    include: { event_attendees: { select: { userId: true } } },
  });
  res.json(
    events.map(({ event_attendees, date, ...event }) => ({
      ...event,
      date: date.toISOString().slice(0, 10),
      attendees: event_attendees.length,
      joined: Boolean(
        req.user?.id && event_attendees.some((attendee) => attendee.userId === req.user!.id),
      ),
    })),
  );
});
eventRouter.put('/:id/join', authenticated, async (req, res) => {
  const id = z.string().uuid().parse(req.params.id);
  const { joined } = z.object({ joined: z.boolean() }).parse(req.body);
  await prisma.$transaction(async (tx) => {
    // Serialize signups and capacity edits for the same event.
    await tx.$queryRaw`SELECT id FROM events WHERE id = ${id} FOR UPDATE`;
    const event = await tx.event.findUnique({
      where: { id },
      select: { date: true, capacity: true },
    });
    if (!event) throw Object.assign(new Error('活动不存在'), { status: 404 });
    if (joined) {
      const eventDate = event.date.toISOString().slice(0, 10);
      const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Shanghai' });
      if (eventDate < today) throw Object.assign(new Error('活动已结束'), { status: 400 });
      const existing = await tx.eventAttendee.findUnique({
        where: { eventId_userId: { eventId: id, userId: req.user!.id } },
      });
      const attendees = await tx.eventAttendee.count({ where: { eventId: id } });
      if (!existing && attendees >= event.capacity)
        throw Object.assign(new Error('活动名额已满'), { status: 409 });
      if (!existing) await tx.eventAttendee.create({ data: { eventId: id, userId: req.user!.id } });
    } else {
      await tx.eventAttendee.deleteMany({ where: { eventId: id, userId: req.user!.id } });
    }
  });
  res.json({ joined });
});
