import { writeFile } from 'node:fs/promises';

const token = process.env.VK_TOKEN || process.env.VK_ACCESS_TOKEN;
const ownerId = '-214535058';
const apiVersion = '5.199';

if (!token) {
  console.error('Set VK_TOKEN or VK_ACCESS_TOKEN to import VK product data.');
  process.exit(1);
}

const endpoint = new URL('https://api.vk.com/method/market.get');
endpoint.searchParams.set('owner_id', ownerId);
endpoint.searchParams.set('count', '200');
endpoint.searchParams.set('extended', '1');
endpoint.searchParams.set('v', apiVersion);
endpoint.searchParams.set('access_token', token);

const response = await fetch(endpoint);
const payload = await response.json();

if (payload.error) {
  console.error(payload.error);
  process.exit(1);
}

const products = payload.response.items.map((item) => {
  const specs = String(item.description || '')
    .split(/\r?\n|;|,/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 6);

  const photo = item.thumb_photo || item.photos?.at(0)?.sizes?.at(-1)?.url || '';
  const price = item.price?.text || 'Цена в VK';

  return {
    badge: item.availability === 0 ? 'В наличии' : 'Под заказ',
    badgeType: item.availability === 0 ? 'available' : 'default',
    title: item.title,
    subtitle: specs.at(0) || 'Игровой ПК TOGOSHOL',
    specs: specs.length ? specs : ['Характеристики в карточке VK'],
    price,
    cta: 'Написать',
    sourceId: `vk-${item.id}`,
    image: photo,
  };
});

const output = `import type { Build } from './builds';\n\nexport const vkProducts: Build[] = ${JSON.stringify(products, null, 2)};\n`;

await writeFile('src/data/vkProducts.ts', output, 'utf8');
console.log(`Imported ${products.length} VK products to src/data/vkProducts.ts`);
