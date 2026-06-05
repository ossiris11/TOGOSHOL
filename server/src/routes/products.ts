import type { FastifyInstance } from 'fastify';
import type { Prisma } from '@prisma/client';
import { prisma } from '../db.js';
import { sendBadRequest } from '../http.js';
import { mapProduct, productInputToDb, slugify } from '../mappers.js';
import { productInputSchema, productPatchSchema } from '../schemas.js';
import { requireAdmin } from '../security.js';

const publicWhere = {
  deletedAt: null,
  status: { in: ['available', 'preorder'] },
};

export async function registerProductRoutes(app: FastifyInstance) {
  app.get('/api/products', async () => {
    const products = await prisma.product.findMany({
      where: publicWhere,
      orderBy: [{ sortOrder: 'asc' }, { price: 'asc' }],
    });
    return { ok: true, items: products.map(mapProduct) };
  });

  app.get<{ Params: { id: string } }>('/api/products/:id', async (request, reply) => {
    const product = await prisma.product.findFirst({
      where: { ...publicWhere, OR: [{ id: request.params.id }, { slug: request.params.id }] },
    });
    if (!product) return reply.code(404).send({ ok: false, message: 'Product not found' });
    return { ok: true, item: mapProduct(product) };
  });

  app.get('/api/admin/products', async (request, reply) => {
    await requireAdmin(request, reply);
    if (reply.sent) return;
    const products = await prisma.product.findMany({
      orderBy: [{ deletedAt: 'asc' }, { sortOrder: 'asc' }, { updatedAt: 'desc' }],
    });
    return { ok: true, items: products.map(mapProduct) };
  });

  app.post('/api/admin/products', async (request, reply) => {
    await requireAdmin(request, reply);
    if (reply.sent) return;
    const parsed = productInputSchema.safeParse(request.body);
    if (!parsed.success) return sendBadRequest(reply, 'Invalid product payload', parsed.error.flatten());

    const input = parsed.data;
    const product = await prisma.product.create({
      data: productInputToDb({ ...input, slug: input.slug || slugify(input.title) }) as Prisma.ProductCreateInput,
    });
    return reply.code(201).send({ ok: true, item: mapProduct(product) });
  });

  app.patch<{ Params: { id: string } }>('/api/admin/products/:id', async (request, reply) => {
    await requireAdmin(request, reply);
    if (reply.sent) return;
    const parsed = productPatchSchema.safeParse(request.body);
    if (!parsed.success) return sendBadRequest(reply, 'Invalid product patch', parsed.error.flatten());

    const product = await prisma.product.update({
      where: { id: request.params.id },
      data: productInputToDb(parsed.data) as Prisma.ProductUpdateInput,
    });
    return { ok: true, item: mapProduct(product) };
  });

  app.delete<{ Params: { id: string } }>('/api/admin/products/:id', async (request, reply) => {
    await requireAdmin(request, reply);
    if (reply.sent) return;
    await prisma.product.update({
      where: { id: request.params.id },
      data: { status: 'archived', deletedAt: new Date(), isFeatured: false, heroSlot: null, featuredSlot: null },
    });
    return { ok: true };
  });

  app.post<{ Params: { id: string } }>('/api/admin/products/:id/restore', async (request, reply) => {
    await requireAdmin(request, reply);
    if (reply.sent) return;
    const product = await prisma.product.update({
      where: { id: request.params.id },
      data: { deletedAt: null, status: 'hidden' },
    });
    return { ok: true, item: mapProduct(product) };
  });

  app.patch('/api/admin/products/reorder', async (request, reply) => {
    await requireAdmin(request, reply);
    if (reply.sent) return;
    const body = request.body as { ids?: string[] };
    if (!Array.isArray(body.ids)) return sendBadRequest(reply, 'ids array required');
    await prisma.$transaction(body.ids.map((id, index) => prisma.product.update({ where: { id }, data: { sortOrder: index + 1 } })));
    return { ok: true };
  });
}
