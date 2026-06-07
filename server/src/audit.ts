import crypto from 'node:crypto';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { prisma } from './db.js';
import { getAdminSession, getRequestIp, hashIp } from './security.js';

const adminWriteMethods = new Set(['POST', 'PATCH', 'DELETE']);

function getAuditTarget(pathname: string) {
  const parts = pathname.split('/').filter(Boolean);
  const adminIndex = parts.indexOf('admin');
  const target = adminIndex >= 0 ? parts[adminIndex + 1] : undefined;
  const targetId = adminIndex >= 0 ? parts[adminIndex + 2] : undefined;
  return {
    target: target || 'admin',
    targetId: targetId && !['login', 'logout', 'password'].includes(targetId) ? targetId : null,
  };
}

export async function recordAdminAudit(request: FastifyRequest, reply: FastifyReply) {
  if (!request.url.startsWith('/api/admin/')) return;
  if (!adminWriteMethods.has(request.method)) return;
  if (reply.statusCode >= 400) return;

  const pathname = request.url.split('?')[0] || request.url;
  const { target, targetId } = getAuditTarget(pathname);
  const session = await getAdminSession(request).catch(() => null);

  await prisma.$executeRawUnsafe(
    `INSERT INTO "AuditLog" ("id", "action", "target", "targetId", "method", "path", "statusCode", "sessionId", "ipHash", "userAgent", "createdAt")
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
    crypto.randomUUID(),
    `${request.method} ${pathname}`,
    target,
    targetId,
    request.method,
    pathname,
    reply.statusCode,
    session?.id || null,
    hashIp(getRequestIp(request)) || null,
    request.headers['user-agent'] || '',
  );
}
