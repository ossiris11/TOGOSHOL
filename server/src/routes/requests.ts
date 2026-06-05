import type { FastifyInstance } from 'fastify';
import { prisma } from '../db.js';
import { sendBadRequest } from '../http.js';
import { requestInputSchema, requestStatusSchema } from '../schemas.js';
import { getRequestIp, hashIp, requireAdmin } from '../security.js';

export async function registerRequestRoutes(app: FastifyInstance) {
  app.post('/api/requests', { config: { rateLimit: { max: 20, timeWindow: '1 hour' } } }, async (request, reply) => {
    const parsed = requestInputSchema.safeParse(request.body);
    if (!parsed.success) return sendBadRequest(reply, 'Invalid request payload', parsed.error.flatten());

    const created = await prisma.customerRequest.create({
      data: {
        ...parsed.data,
        productId: parsed.data.productId || null,
        ipHash: hashIp(getRequestIp(request)),
        userAgent: request.headers['user-agent'] || '',
      },
    });

    await prisma.metricEvent.create({
      data: {
        type: 'request_created',
        requestId: created.id,
        productId: created.productId,
        pagePath: created.pagePath,
        ipHash: hashIp(getRequestIp(request)),
        userAgent: request.headers['user-agent'] || '',
        metaJson: JSON.stringify({ source: created.source }),
      },
    });

    return reply.code(201).send({ ok: true, requestId: created.id });
  });

  app.get('/api/admin/requests', async (request, reply) => {
    await requireAdmin(request, reply);
    if (reply.sent) return;
    const items = await prisma.customerRequest.findMany({
      orderBy: { createdAt: 'desc' },
      include: { product: true },
      take: 300,
    });
    return {
      ok: true,
      items: items.map((item) => ({
        ...item,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
        product: item.product ? { id: item.product.id, title: item.product.title, priceText: item.product.priceText } : null,
      })),
    };
  });

  app.patch<{ Params: { id: string } }>('/api/admin/requests/:id', async (request, reply) => {
    await requireAdmin(request, reply);
    if (reply.sent) return;
    const parsed = requestStatusSchema.safeParse(request.body);
    if (!parsed.success) return sendBadRequest(reply, 'Invalid request status', parsed.error.flatten());
    const updated = await prisma.customerRequest.update({ where: { id: request.params.id }, data: parsed.data });
    return { ok: true, item: { ...updated, createdAt: updated.createdAt.toISOString(), updatedAt: updated.updatedAt.toISOString() } };
  });

  app.delete<{ Params: { id: string } }>('/api/admin/requests/:id', async (request, reply) => {
    await requireAdmin(request, reply);
    if (reply.sent) return;
    await prisma.customerRequest.update({ where: { id: request.params.id }, data: { status: 'archived' } });
    return { ok: true };
  });
}
