import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { config } from '../config.js';
import { prisma } from '../db.js';
import { sendBadRequest } from '../http.js';
import { createSessionToken, getAdminSession, getRequestIp, hashIp, hashPassword, hashToken, requireAdmin, verifyAdminPasswordWithSettings } from '../security.js';

const loginSchema = z.object({
  password: z.string().min(1).max(300),
});

export async function registerAuthRoutes(app: FastifyInstance) {
  app.post('/api/admin/login', { config: { rateLimit: { max: 8, timeWindow: '10 minutes' } } }, async (request, reply) => {
    const parsed = loginSchema.safeParse(request.body);
    if (!parsed.success) return sendBadRequest(reply, 'Invalid login payload', parsed.error.flatten());

    if (!(await verifyAdminPasswordWithSettings(parsed.data.password))) {
      return reply.code(401).send({ ok: false, message: 'Invalid password' });
    }

    const token = createSessionToken();
    const expiresAt = new Date(Date.now() + config.sessionTtlDays * 24 * 60 * 60 * 1000);
    await prisma.adminSession.create({
      data: {
        tokenHash: hashToken(token),
        expiresAt,
        ipHash: hashIp(getRequestIp(request)),
        userAgent: request.headers['user-agent'] || '',
      },
    });

    reply.setCookie(config.sessionCookieName, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: config.isProduction,
      path: '/',
      expires: expiresAt,
    });

    return reply.send({ ok: true, expiresAt: expiresAt.toISOString() });
  });

  app.post('/api/admin/logout', async (request, reply) => {
    const token = request.cookies[config.sessionCookieName];
    if (token) await prisma.adminSession.deleteMany({ where: { tokenHash: hashToken(token) } });
    reply.clearCookie(config.sessionCookieName, { path: '/' });
    return reply.send({ ok: true });
  });

  app.get('/api/admin/me', async (request, reply) => {
    await requireAdmin(request, reply);
    if (reply.sent) return;
    const session = await getAdminSession(request);
    return reply.send({
      ok: true,
      session: session
        ? {
            id: session.id,
            expiresAt: session.expiresAt.toISOString(),
            lastSeenAt: session.lastSeenAt.toISOString(),
          }
        : null,
    });
  });

  app.patch('/api/admin/password', async (request, reply) => {
    await requireAdmin(request, reply);
    if (reply.sent) return;

    const parsed = z.object({ password: z.string().min(4).max(300) }).safeParse(request.body);
    if (!parsed.success) return sendBadRequest(reply, 'Invalid password payload', parsed.error.flatten());

    await prisma.adminSetting.upsert({
      where: { key: 'adminPasswordHash' },
      update: { value: hashPassword(parsed.data.password) },
      create: { key: 'adminPasswordHash', value: hashPassword(parsed.data.password) },
    });

    await prisma.adminSession.deleteMany({
      where: {
        tokenHash: {
          not: hashToken(request.cookies[config.sessionCookieName] || ''),
        },
      },
    });

    return reply.send({ ok: true });
  });
}
