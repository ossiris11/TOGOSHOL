import type { FastifyInstance } from 'fastify';
import { prisma } from '../db.js';
import { parseJsonArray, sendBadRequest } from '../http.js';
import { mapProduct } from '../mappers.js';
import { pageBlocksSchema } from '../schemas.js';
import { requireAdmin } from '../security.js';

const blockKeys = ['heroProductIds', 'featuredProductIds', 'finalCtaProductIds'] as const;

async function getBlockValues() {
  const blocks = await prisma.pageBlock.findMany();
  const byKey = new Map(blocks.map((block) => [block.key, parseJsonArray(block.itemsJson).filter((item): item is string => typeof item === 'string')]));
  return {
    heroProductIds: byKey.get('heroProductIds') || [],
    featuredProductIds: byKey.get('featuredProductIds') || [],
    finalCtaProductIds: byKey.get('finalCtaProductIds') || [],
  };
}

async function loadProducts(ids: string[]) {
  if (ids.length === 0) return [];
  const products = await prisma.product.findMany({
    where: { id: { in: ids }, deletedAt: null, status: { in: ['available', 'preorder'] } },
  });
  const byId = new Map(products.map((product) => [product.id, product]));
  return ids
    .map((id) => byId.get(id))
    .filter((product): product is NonNullable<typeof product> => Boolean(product))
    .map(mapProduct);
}

export async function registerPageBlockRoutes(app: FastifyInstance) {
  app.get('/api/page-blocks', async () => {
    const blocks = await getBlockValues();
    return {
      ok: true,
      blocks,
      products: {
        hero: await loadProducts(blocks.heroProductIds),
        featured: await loadProducts(blocks.featuredProductIds),
        finalCta: await loadProducts(blocks.finalCtaProductIds),
      },
    };
  });

  app.get('/api/admin/page-blocks', async (request, reply) => {
    await requireAdmin(request, reply);
    if (reply.sent) return;
    return { ok: true, blocks: await getBlockValues() };
  });

  app.patch('/api/admin/page-blocks', async (request, reply) => {
    await requireAdmin(request, reply);
    if (reply.sent) return;
    const parsed = pageBlocksSchema.safeParse(request.body);
    if (!parsed.success) return sendBadRequest(reply, 'Invalid page blocks payload', parsed.error.flatten());

    await prisma.$transaction(
      blockKeys.map((key) =>
        prisma.pageBlock.upsert({
          where: { key },
          update: { itemsJson: JSON.stringify(parsed.data[key]) },
          create: { key, title: key, itemsJson: JSON.stringify(parsed.data[key]) },
        }),
      ),
    );
    return { ok: true, blocks: parsed.data };
  });
}
