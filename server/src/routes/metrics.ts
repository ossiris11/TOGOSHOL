import os from 'node:os';
import type { FastifyInstance } from 'fastify';
import { config } from '../config.js';
import { prisma } from '../db.js';
import { sendBadRequest } from '../http.js';
import { metricEventSchema } from '../schemas.js';
import { getRequestIp, hashIp, requireAdmin } from '../security.js';

function daysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function dayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getServerStats() {
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  const usedMemory = totalMemory - freeMemory;
  const cpuCount = Math.max(1, os.cpus().length);
  const loadAverage1m = os.loadavg()[0] || 0;
  const memoryUsedPercent = Math.round((usedMemory / totalMemory) * 100);
  const cpuLoadPercent = Math.min(100, Math.round((loadAverage1m / cpuCount) * 100));

  return {
    hostname: os.hostname(),
    platform: os.platform(),
    uptimeSeconds: Math.round(os.uptime()),
    cpuCount,
    loadAverage1m,
    cpuLoadPercent,
    totalMemory,
    freeMemory,
    usedMemory,
    memoryUsedPercent,
    processMemoryRss: process.memoryUsage().rss,
  };
}

const contactMetricTypes = ['contact_click_vk', 'contact_click_telegram', 'contact_click_instagram', 'contact_click_avito', 'contact_click_max'];
const clickMetricTypes = [...contactMetricTypes, 'product_cta_click', 'product_details_click', 'custom_pc_modal_open'];
const requestMetricTypes = ['request_created', 'configurator_submit'];
let lastMetricPurgeAt = 0;

async function purgeOldMetricEvents() {
  if (config.metricRetentionDays <= 0) return;
  const now = Date.now();
  if (now - lastMetricPurgeAt < 12 * 60 * 60 * 1000) return;
  lastMetricPurgeAt = now;

  await prisma.metricEvent.deleteMany({
    where: { createdAt: { lt: daysAgo(config.metricRetentionDays) } },
  });
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
    await purgeOldMetricEvents().catch((error) => request.log.warn({ error }, 'failed to purge old metric events'));
    return reply.code(204).send();
  });

  app.get('/api/admin/dashboard', async (request, reply) => {
    await requireAdmin(request, reply);
    if (reply.sent) return;

    const chartStart = startOfDay(daysAgo(13));
    const [eventsToday, events7d, pageViewsToday, pageViews7d, clicks7d, requestsNew, reviewsPending, productsActive, recentRequests, topProductEvents, contactEvents, eventsForChart, topPages] = await Promise.all([
      prisma.metricEvent.count({ where: { createdAt: { gte: daysAgo(1) } } }),
      prisma.metricEvent.count({ where: { createdAt: { gte: daysAgo(7) } } }),
      prisma.metricEvent.count({ where: { type: 'page_view', createdAt: { gte: daysAgo(1) } } }),
      prisma.metricEvent.count({ where: { type: 'page_view', createdAt: { gte: daysAgo(7) } } }),
      prisma.metricEvent.count({ where: { type: { in: clickMetricTypes }, createdAt: { gte: daysAgo(7) } } }),
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
        where: { type: { in: contactMetricTypes }, createdAt: { gte: daysAgo(30) } },
        _count: { _all: true },
      }),
      prisma.metricEvent.findMany({
        where: { createdAt: { gte: chartStart } },
        select: { type: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.metricEvent.groupBy({
        by: ['pagePath'],
        where: { type: 'page_view', pagePath: { not: null }, createdAt: { gte: daysAgo(30) } },
        _count: { _all: true },
        orderBy: { _count: { pagePath: 'desc' } },
        take: 8,
      }),
    ]);

    const productIds = topProductEvents.map((event) => event.productId).filter((id): id is string => Boolean(id));
    const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
    const byId = new Map(products.map((product) => [product.id, product]));
    const chartDays = Array.from({ length: 14 }, (_, index) => {
      const date = startOfDay(daysAgo(13 - index));
      return { date: dayKey(date), pageViews: 0, clicks: 0, requests: 0 };
    });
    const byDate = new Map(chartDays.map((item) => [item.date, item]));
    for (const event of eventsForChart) {
      const item = byDate.get(dayKey(event.createdAt));
      if (!item) continue;
      if (event.type === 'page_view') item.pageViews += 1;
      if ((clickMetricTypes as readonly string[]).includes(event.type)) item.clicks += 1;
      if ((requestMetricTypes as readonly string[]).includes(event.type)) item.requests += 1;
    }

    return {
      ok: true,
      stats: { eventsToday, events7d, pageViewsToday, pageViews7d, clicks7d, requestsNew, reviewsPending, productsActive },
      server: getServerStats(),
      chart: chartDays,
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
      topPages: topPages.map((event) => ({ path: event.pagePath || '/', count: event._count._all })),
      contacts: contactEvents.map((event) => ({ type: event.type, count: event._count?._all || 0 })),
    };
  });
}
