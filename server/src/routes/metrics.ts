import type { FastifyInstance } from 'fastify';
import { prisma } from '../db.js';
import { sendBadRequest } from '../http.js';
import { metricEventSchema } from '../schemas.js';
import { getRequestIp, hashIp, requireAdmin } from '../security.js';

function daysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

export async function registerMetricRoutes(app: FastifyInstance) {
  app.post('/api/metrics/events', { config: { rateLimit: { max: 120, timeWindow: '1 hour' } } }, async (request, reply) => {
    const parsed = metricEventSchema.safeParse(request.body);
    if (!parsed.success) return sendBadRequest(reply, 'Invalid metric event', parsed.error.flatten());

    await prisma.metricEvent.create({
      data: {
        type: parsed.data.type,
        pagePath: parsed.data.pagePath || null,
        productId: parsed.data.productId || null,
        requestId: parsed.data.requestId || null,
        metaJson: JSON.stringify(parsed.data.meta || {}),
        ipHash: hashIp(getRequestIp(request)),
        userAgent: request.headers['user-agent'] || '',
      },
    });
    return reply.code(204).send();
  });

  app.get('/api/admin/dashboard', async (request, reply) => {
    await requireAdmin(request, reply);
    if (reply.sent) return;

    const [eventsToday, events7d, requestsNew, reviewsPending, productsActive, recentRequests, topProductEvents, contactEvents] = await Promise.all([
      prisma.metricEvent.count({ where: { createdAt: { gte: daysAgo(1) } } }),
      prisma.metricEvent.count({ where: { createdAt: { gte: daysAgo(7) } } }),
      prisma.customerRequest.count({ where: { status: 'new' } }),
      prisma.review.count({ where: { status: 'pending', deletedAt: null } }),
      prisma.product.count({ where: { deletedAt: null, status: { in: ['available', 'preorder'] } } }),
      prisma.customerRequest.findMany({ orderBy: { createdAt: 'desc' }, take: 8, include: { product: true } }),
      prisma.metricEvent.groupBy({
        by: ['productId'],
        where: { productId: { not: null }, createdAt: { gte: daysAgo(30) } },
        _count: { _all: true },
        orderBy: { _count: { productId: 'desc' } },
        take: 8,
      }),
      prisma.metricEvent.groupBy({
        by: ['type'],
        where: { type: { in: ['contact_click_vk', 'contact_click_telegram', 'contact_click_max', 'product_cta_click'] }, createdAt: { gte: daysAgo(30) } },
        _count: { _all: true },
      }),
    ]);

    const productIds = topProductEvents.map((event) => event.productId).filter((id): id is string => Boolean(id));
    const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
    const byId = new Map(products.map((product) => [product.id, product]));

    return {
      ok: true,
      stats: { eventsToday, events7d, requestsNew, reviewsPending, productsActive },
      recentRequests: recentRequests.map((item) => ({
        id: item.id,
        status: item.status,
        source: item.source,
        contact: item.contact,
        budget: item.budget,
        productTitle: item.product?.title || '',
        createdAt: item.createdAt.toISOString(),
      })),
      topProducts: topProductEvents.map((event) => ({
        productId: event.productId,
        title: event.productId ? byId.get(event.productId)?.title || 'Удаленный товар' : 'Без товара',
        count: event._count._all,
      })),
      contacts: contactEvents.map((event) => ({ type: event.type, count: event._count._all })),
    };
  });
}
