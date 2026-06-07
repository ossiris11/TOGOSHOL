import type { FastifyInstance } from 'fastify';
import type { Prisma } from '@prisma/client';
import { prisma } from '../db.js';
import { isPrismaErrorCode, parseJsonArray, sendBadRequest, sendNotFound } from '../http.js';
import { componentOptionPatchSchema, componentOptionSchema } from '../schemas.js';
import { requireAdmin } from '../security.js';

function mapComponent(option: {
  id: string;
  category: string;
  title: string;
  subtitle: string;
  price: number;
  wattage: number;
  tagsJson: string;
  status: string;
  sortOrder: number;
  description: string;
  deletedAt?: Date | null;
}) {
  return {
    id: option.id,
    category: option.category,
    title: option.title,
    subtitle: option.subtitle,
    price: option.price,
    wattage: option.wattage,
    tags: parseJsonArray(option.tagsJson),
    status: option.status,
    sortOrder: option.sortOrder,
    description: option.description,
    deletedAt: option.deletedAt?.toISOString() || null,
  };
}

function toDb(input: Record<string, unknown>) {
  const copy = { ...input };
  if (Array.isArray(copy.tags)) {
    copy.tagsJson = JSON.stringify(copy.tags);
    delete copy.tags;
  }
  return copy;
}

export async function registerComponentRoutes(app: FastifyInstance) {
  app.get('/api/custom-components', async () => {
    const items = await prisma.componentOption.findMany({
      where: { deletedAt: null, status: 'available' },
      orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }, { price: 'asc' }],
    });
    return { ok: true, items: items.map(mapComponent) };
  });

  app.get('/api/admin/components', async (request, reply) => {
    await requireAdmin(request, reply);
    if (reply.sent) return;
    const items = await prisma.componentOption.findMany({
      orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }, { updatedAt: 'desc' }],
    });
    return { ok: true, items: items.map(mapComponent) };
  });

  app.post('/api/admin/components', async (request, reply) => {
    await requireAdmin(request, reply);
    if (reply.sent) return;
    const parsed = componentOptionSchema.safeParse(request.body);
    if (!parsed.success) return sendBadRequest(reply, 'Invalid component payload', parsed.error.flatten());
    const item = await prisma.componentOption.create({ data: toDb(parsed.data) as Prisma.ComponentOptionCreateInput });
    return reply.code(201).send({ ok: true, item: mapComponent(item) });
  });

  app.patch<{ Params: { id: string } }>('/api/admin/components/:id', async (request, reply) => {
    await requireAdmin(request, reply);
    if (reply.sent) return;
    const parsed = componentOptionPatchSchema.safeParse(request.body);
    if (!parsed.success) return sendBadRequest(reply, 'Invalid component patch', parsed.error.flatten());
    try {
      const item = await prisma.componentOption.update({ where: { id: request.params.id }, data: toDb(parsed.data) as Prisma.ComponentOptionUpdateInput });
      return { ok: true, item: mapComponent(item) };
    } catch (error) {
      if (isPrismaErrorCode(error, 'P2025')) return sendNotFound(reply, 'Component option not found');
      throw error;
    }
  });

  app.delete<{ Params: { id: string } }>('/api/admin/components/:id', async (request, reply) => {
    await requireAdmin(request, reply);
    if (reply.sent) return;
    try {
      await prisma.componentOption.update({ where: { id: request.params.id }, data: { status: 'archived', deletedAt: new Date() } });
      return { ok: true };
    } catch (error) {
      if (isPrismaErrorCode(error, 'P2025')) return sendNotFound(reply, 'Component option not found');
      throw error;
    }
  });
}
