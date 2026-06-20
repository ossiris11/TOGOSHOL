import type { FastifyInstance } from 'fastify';
import type { Prisma } from '@prisma/client';
import { prisma } from '../db.js';
import { isPrismaErrorCode, sendBadRequest, sendConflict, sendNotFound } from '../http.js';
import { mapProduct, productInputToDb, slugify } from '../mappers.js';
import { productInputSchema, productPatchSchema } from '../schemas.js';
import { requireAdmin } from '../security.js';

const publicWhere = {
  deletedAt: null,
  status: { in: ['available', 'preorder'] },
};

async function deleteProductPermanently(id: string) {
  await prisma.$transaction([
    prisma.customerRequest.updateMany({ where: { productId: id }, data: { productId: null } }),
    prisma.review.updateMany({ where: { productId: id }, data: { productId: null } }),
    prisma.metricEvent.updateMany({ where: { productId: id }, data: { productId: null } }),
    prisma.product.delete({ where: { id } }),
  ]);
}

async function purgeExpiredTrash() {
  const expiresAt = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000);
  const expired = await prisma.product.findMany({
    where: { deletedAt: { lt: expiresAt } },
    select: { id: true },
    take: 50,
  });

  for (const product of expired) {
    await deleteProductPermanently(product.id);
  }
}

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
    await purgeExpiredTrash();
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
    try {
      const product = await prisma.product.create({
        data: productInputToDb({ ...input, slug: input.slug || slugify(input.title), isFeatured: false, featuredSlot: null }) as Prisma.ProductCreateInput,
      });
      return reply.code(201).send({ ok: true, item: mapProduct(product) });
    } catch (error) {
      if (isPrismaErrorCode(error, 'P2002')) return sendConflict(reply, 'Product slug already exists');
      throw error;
    }
  });

  app.patch<{ Params: { id: string } }>('/api/admin/products/:id', async (request, reply) => {
    await requireAdmin(request, reply);
    if (reply.sent) return;
    const parsed = productPatchSchema.safeParse(request.body);
    if (!parsed.success) return sendBadRequest(reply, 'Invalid product patch', parsed.error.flatten());

    try {
      const productPatch = { ...parsed.data };
      delete productPatch.isFeatured;
      delete productPatch.featuredSlot;
      const product = await prisma.product.update({
        where: { id: request.params.id },
        data: productInputToDb(productPatch) as Prisma.ProductUpdateInput,
      });
      return { ok: true, item: mapProduct(product) };
    } catch (error) {
      if (isPrismaErrorCode(error, 'P2025')) return sendNotFound(reply, 'Product not found');
      if (isPrismaErrorCode(error, 'P2002')) return sendConflict(reply, 'Product slug already exists');
      throw error;
    }
  });

  app.delete<{ Params: { id: string } }>('/api/admin/products/:id', async (request, reply) => {
    await requireAdmin(request, reply);
    if (reply.sent) return;
    try {
      await prisma.product.update({
        where: { id: request.params.id },
        data: { status: 'archived', deletedAt: new Date(), isFeatured: false, heroSlot: null, featuredSlot: null },
      });
      return { ok: true };
    } catch (error) {
      if (isPrismaErrorCode(error, 'P2025')) return sendNotFound(reply, 'Product not found');
      throw error;
    }
  });

  app.delete<{ Params: { id: string } }>('/api/admin/products/:id/permanent', async (request, reply) => {
    await requireAdmin(request, reply);
    if (reply.sent) return;
    const product = await prisma.product.findUnique({ where: { id: request.params.id } });
    if (!product) return reply.code(404).send({ ok: false, message: 'Product not found' });
    if (!product.deletedAt) return reply.code(409).send({ ok: false, message: 'Move product to trash before permanent delete' });
    await deleteProductPermanently(product.id);
    return { ok: true };
  });

  app.post<{ Params: { id: string } }>('/api/admin/products/:id/restore', async (request, reply) => {
    await requireAdmin(request, reply);
    if (reply.sent) return;
    try {
      const product = await prisma.product.update({
        where: { id: request.params.id },
        data: { deletedAt: null, status: 'hidden' },
      });
      return { ok: true, item: mapProduct(product) };
    } catch (error) {
      if (isPrismaErrorCode(error, 'P2025')) return sendNotFound(reply, 'Product not found');
      throw error;
    }
  });

  app.patch('/api/admin/products/reorder', async (request, reply) => {
    await requireAdmin(request, reply);
    if (reply.sent) return;
    const body = request.body as { ids?: string[] };
    if (!Array.isArray(body.ids)) return sendBadRequest(reply, 'ids array required');
    try {
      await prisma.$transaction(body.ids.map((id, index) => prisma.product.update({ where: { id }, data: { sortOrder: index + 1 } })));
      return { ok: true };
    } catch (error) {
      if (isPrismaErrorCode(error, 'P2025')) return sendNotFound(reply, 'Product not found');
      throw error;
    }
  });
}
