import type { FastifyInstance } from 'fastify';
import { prisma } from '../db.js';
import { requireAdmin } from '../security.js';

type AuditRow = {
  id: string;
  action: string;
  target: string;
  targetId: string | null;
  method: string;
  path: string;
  statusCode: number;
  sessionId: string | null;
  ipHash: string | null;
  userAgent: string | null;
  createdAt: string;
};

export async function registerAuditLogRoutes(app: FastifyInstance) {
  app.get('/api/admin/audit-logs', async (request, reply) => {
    await requireAdmin(request, reply);
    if (reply.sent) return;

    const rows = await prisma.$queryRawUnsafe<AuditRow[]>(
      `SELECT "id", "action", "target", "targetId", "method", "path", "statusCode", "sessionId", "ipHash", "userAgent", "createdAt"
       FROM "AuditLog"
       ORDER BY "createdAt" DESC
       LIMIT 200`,
    );

    return { ok: true, items: rows };
  });
}
