import { PrismaClient } from '@prisma/client';
import { vkProducts } from '../../src/data/vkProducts.ts';
import { getProductDetails, getProductViews, parsePriceValue } from '../../src/lib/products.ts';
import { hashPassword } from '../src/security.ts';

const prisma = new PrismaClient();
const seedAdminPassword = process.env.ADMIN_PASSWORD || '1111000010';

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/ё/g, 'e')
    .replace(/[^a-z0-9а-я]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90);
}

function classFromTier(tier: string) {
  if (tier === 'Full HD') return 'fullhd';
  if (tier === '2K') return 'qhd';
  if (tier === 'Топ') return 'top';
  return 'custom';
}

const componentSeeds = [
  ['cpu', 'AMD Ryzen 5 5500', '6 ядер / 12 потоков, выгодный старт', 6900, 65, ['Full HD', 'выгодно']],
  ['cpu', 'AMD Ryzen 5 7500F', 'AM5, отличный баланс для 2K', 13900, 65, ['2K', 'AM5']],
  ['cpu', 'AMD Ryzen 7 7800X3D', 'топ для игр, холодный и быстрый', 34900, 120, ['топ', '4K']],
  ['gpu', 'Nvidia RTX 3060 Ti', 'Full HD / 2K, разумный бюджет', 21900, 200, ['Full HD', '2K']],
  ['gpu', 'Nvidia RTX 3070 8GB', 'сильный 2K-гейминг', 28900, 220, ['2K', 'хит']],
  ['gpu', 'Nvidia RTX 4070 Super 12GB', 'тихо, мощно, запас под 2K/4K', 62900, 220, ['2K', '4K']],
  ['gpu', 'Nvidia RTX 5080 16GB', 'флагман под 4K и тяжелую работу', 139900, 360, ['топ', '4K']],
  ['motherboard', 'B550M / B650M по платформе', 'подберем совместимую плату', 8900, 0, ['совместимость']],
  ['motherboard', 'B650 Wi-Fi', 'AM5, Wi-Fi, запас под апгрейд', 16900, 0, ['AM5', 'Wi-Fi']],
  ['ram', '16GB DDR4 / DDR5', 'минимум для игр', 4900, 0, ['старт']],
  ['ram', '32GB DDR4 / DDR5', 'комфортный запас', 8900, 0, ['рекомендуем']],
  ['ram', '64GB DDR5', 'монтаж, 3D, AI', 18900, 0, ['работа']],
  ['storage', 'SSD NVMe 512GB', 'быстрый старт', 3900, 0, ['старт']],
  ['storage', 'SSD NVMe 1TB', 'оптимально под игры', 6900, 0, ['рекомендуем']],
  ['storage', 'SSD NVMe 2TB', 'большая библиотека игр', 12900, 0, ['запас']],
  ['psu', '600W 80+ Bronze', 'для стартовых сборок', 4900, 0, ['старт']],
  ['psu', '750W 80+ Gold', 'запас и тишина', 8900, 0, ['рекомендуем']],
  ['psu', '1000W 80+ Gold', 'для флагманских видеокарт', 15900, 0, ['топ']],
  ['cooling', 'Башенное охлаждение', 'тихо и надежно', 3900, 0, ['тихо']],
  ['cooling', 'СЖО 240mm', 'для горячих CPU и красоты', 8900, 0, ['RGB']],
  ['cooling', 'СЖО 360mm', 'для топовых сборок', 14900, 0, ['топ']],
  ['case', 'Airflow Black', 'строгий корпус с продувом', 6900, 0, ['airflow']],
  ['case', 'RGB Glass', 'акцентный корпус с подсветкой', 8900, 0, ['RGB']],
  ['case', 'Premium Compact', 'плотная аккуратная сборка', 12900, 0, ['premium']],
  ['os', 'Windows 11 Pro + драйверы', 'установка и первичная настройка', 4900, 0, ['готово']],
  ['service', 'Стресс-тест и кабель-менеджмент', 'входит в сборку TOGOSHOL', 0, 0, ['включено']],
] as const;

async function main() {
  const views = getProductViews(vkProducts);

  for (const [index, product] of views.entries()) {
    const details = getProductDetails(product);
    const sourceId = product.sourceId || `seed-${index}`;
    const title = product.normalizedTitle || product.title;
    const slug = slugify(`${title}-${sourceId}`) || `product-${index}`;

    await prisma.product.upsert({
      where: { slug },
      update: {
        title,
        status: 'available',
        badge: product.badge,
        badgeType: product.badgeType || 'available',
        price: parsePriceValue(product.price),
        priceText: product.price,
        imageUrl: product.image || null,
        cpu: details.cpu,
        gpu: details.gpu,
        ram: details.ram,
        storage: details.storage,
        psu: details.psu,
        specsJson: JSON.stringify(product.cleanSpecs),
        productClass: classFromTier(product.gpuTier),
        scenario: product.useCase,
        sortOrder: index + 1,
        isFeatured: index < 6,
        featuredSlot: index < 6 ? index : null,
        sourceType: 'vk_import',
        externalId: sourceId,
      },
      create: {
        title,
        slug,
        status: 'available',
        badge: product.badge,
        badgeType: product.badgeType || 'available',
        price: parsePriceValue(product.price),
        priceText: product.price,
        imageUrl: product.image || null,
        cpu: details.cpu,
        gpu: details.gpu,
        ram: details.ram,
        storage: details.storage,
        psu: details.psu,
        specsJson: JSON.stringify(product.cleanSpecs),
        productClass: classFromTier(product.gpuTier),
        scenario: product.useCase,
        sortOrder: index + 1,
        isFeatured: index < 6,
        heroSlot: index === 1 ? 0 : null,
        featuredSlot: index < 6 ? index : null,
        sourceType: 'vk_import',
        externalId: sourceId,
      },
    });
  }

  const seededProducts = await prisma.product.findMany({
    where: { deletedAt: null, status: { in: ['available', 'preorder'] } },
    orderBy: [{ sortOrder: 'asc' }],
    take: 6,
  });

  const heroIds = seededProducts.slice(1, 2).map((product) => product.id);
  const featuredIds = seededProducts.map((product) => product.id);
  const finalCtaIds = seededProducts.slice(0, 1).map((product) => product.id);

  await prisma.pageBlock.upsert({
    where: { key: 'heroProductIds' },
    update: { itemsJson: JSON.stringify(heroIds) },
    create: { key: 'heroProductIds', title: 'Hero products', itemsJson: JSON.stringify(heroIds) },
  });
  await prisma.pageBlock.upsert({
    where: { key: 'featuredProductIds' },
    update: { itemsJson: JSON.stringify(featuredIds) },
    create: { key: 'featuredProductIds', title: 'Featured products', itemsJson: JSON.stringify(featuredIds) },
  });
  await prisma.pageBlock.upsert({
    where: { key: 'finalCtaProductIds' },
    update: { itemsJson: JSON.stringify(finalCtaIds) },
    create: { key: 'finalCtaProductIds', title: 'Final CTA products', itemsJson: JSON.stringify(finalCtaIds) },
  });

  await prisma.adminSetting.upsert({
    where: { key: 'adminPasswordHash' },
    update: { value: hashPassword(seedAdminPassword) },
    create: { key: 'adminPasswordHash', value: hashPassword(seedAdminPassword) },
  });

  for (const [index, item] of componentSeeds.entries()) {
    const [category, title, subtitle, price, wattage, tags] = item;
    await prisma.componentOption.upsert({
      where: { id: `seed-component-${category}-${index}` },
      update: {
        category,
        title,
        subtitle,
        price,
        wattage,
        tagsJson: JSON.stringify(tags),
        status: 'available',
        sortOrder: index + 1,
      },
      create: {
        id: `seed-component-${category}-${index}`,
        category,
        title,
        subtitle,
        price,
        wattage,
        tagsJson: JSON.stringify(tags),
        status: 'available',
        sortOrder: index + 1,
      },
    });
  }

  console.log(`Seeded ${views.length} products and ${componentSeeds.length} component options`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
