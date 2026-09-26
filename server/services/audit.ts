import { prisma } from '../db/client';
export const audit = (actor: string, action: string) =>
  prisma.auditLog.create({ data: { actor, action } });
