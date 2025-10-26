import { prisma } from './prisma';

interface AuditParams {
  userId?: string | null;
  action: string;
  entity: string;
  entityId: string;
  before?: unknown;
  after?: unknown;
  ip?: string | null;
}

export async function writeAuditLog({ userId, action, entity, entityId, before, after, ip }: AuditParams) {
  await prisma.auditLog.create({
    data: {
      userId: userId ?? undefined,
      action,
      entity,
      entityId,
      before: before ? JSON.parse(JSON.stringify(before)) : undefined,
      after: after ? JSON.parse(JSON.stringify(after)) : undefined,
      ip: ip ?? undefined
    }
  });
}
