import type { FastifyInstance } from 'fastify';
import { prisma } from '../db.js';
import { sendBadRequest } from '../http.js';
import { mapReview } from '../mappers.js';
import { reviewInputSchema, reviewPatchSchema } from '../schemas.js';
import { requireAdmin } from '../security.js';

function publishedAtFor(status?: string) {
  return status === 'published' ? new Date() : undefined;
}

export async function registerReviewRoutes(app: FastifyInstance) {
  app.get('/api/reviews', async () => {
    const reviews = await prisma.review.findMany({
      where: { status: 'published', deletedAt: null },
      orderBy: [{ isPinned: 'desc' }, { sortOrder: 'asc' }, { publishedAt: 'desc' }],
      take: 24,
    });
    return { ok: true, items: reviews.map(mapReview) };
  });

  app.get('/api/admin/reviews', async (request, reply) => {
    await requireAdmin(request, reply);
    if (reply.sent) return;
    const reviews = await prisma.review.findMany({
      where: { deletedAt: null },
      orderBy: [{ status: 'asc' }, { isPinned: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'desc' }],
    });
    return { ok: true, items: reviews.map(mapReview) };
  });

  app.post('/api/admin/reviews', async (request, reply) => {
    await requireAdmin(request, reply);
    if (reply.sent) return;
    const parsed = reviewInputSchema.safeParse(request.body);
    if (!parsed.success) return sendBadRequest(reply, 'Invalid review payload', parsed.error.flatten());

    const review = await prisma.review.create({
      data: {
        ...parsed.data,
        productId: parsed.data.productId || null,
        publishedAt: publishedAtFor(parsed.data.status),
      },
    });
    return reply.code(201).send({ ok: true, item: mapReview(review) });
  });

  app.post('/api/admin/reviews/import', async (request, reply) => {
    await requireAdmin(request, reply);
    if (reply.sent) return;
    const parsed = reviewInputSchema.safeParse(request.body);
    if (!parsed.success) return sendBadRequest(reply, 'Invalid imported review payload', parsed.error.flatten());

    const review = await prisma.review.create({
      data: {
        ...parsed.data,
        status: 'pending',
        source: parsed.data.source || 'avito',
        productId: parsed.data.productId || null,
      },
    });
    return reply.code(201).send({ ok: true, item: mapReview(review) });
  });

  app.patch<{ Params: { id: string } }>('/api/admin/reviews/:id', async (request, reply) => {
    await requireAdmin(request, reply);
    if (reply.sent) return;
    const parsed = reviewPatchSchema.safeParse(request.body);
    if (!parsed.success) return sendBadRequest(reply, 'Invalid review patch', parsed.error.flatten());

    const review = await prisma.review.update({
      where: { id: request.params.id },
      data: {
        ...parsed.data,
        productId: parsed.data.productId || undefined,
        publishedAt: parsed.data.status === 'published' ? new Date() : undefined,
      },
    });
    return { ok: true, item: mapReview(review) };
  });

  app.delete<{ Params: { id: string } }>('/api/admin/reviews/:id', async (request, reply) => {
    await requireAdmin(request, reply);
    if (reply.sent) return;
    await prisma.review.update({ where: { id: request.params.id }, data: { status: 'hidden', deletedAt: new Date() } });
    return { ok: true };
  });
}
