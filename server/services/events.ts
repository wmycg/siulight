import type { z } from 'zod';
import type { eventSchema } from '../../shared/validation';
import { prisma, toDatabaseDate } from '../db/client';
/** Use the same row lock as signup so an edit cannot undercut existing reservations. */
export async function updateEvent(id: string, data: z.infer<typeof eventSchema>) {
  await prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM events WHERE id = ${id} FOR UPDATE`;
    const existing = await tx.event.findUnique({ where: { id }, select: { id: true } });
    if (!existing) throw Object.assign(new Error('活动不存在'), { status: 404 });
    const attendees = await tx.eventAttendee.count({ where: { eventId: id } });
    if (data.capacity < attendees)
      throw Object.assign(new Error('人数上限不能小于当前报名人数'), { status: 409 });
    await tx.event.update({
      where: { id },
      data: {
        title: data.title,
        date: toDatabaseDate(data.date),
        place: data.place,
        brief: data.brief,
        body: data.body,
        image: data.image,
        category: data.category,
        capacity: data.capacity,
      },
    });
  });
}
