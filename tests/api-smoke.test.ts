import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { after, before, test } from 'node:test';

process.env.NODE_ENV = 'test';
process.env.ADMIN_PASSWORD = '1111000010';
process.env.SESSION_SECRET = 'test-session-secret-for-api-smoke-suite';

const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'togoshol-api-'));
process.env.DATABASE_URL = `file:${path.join(tempDir, 'togoshol.sqlite')}`;
process.env.UPLOAD_DIR = path.join(tempDir, 'uploads');

const { buildApp } = await import('../server/src/app.js');
const { prisma } = await import('../server/src/db.js');

const app = await buildApp();
let adminCookie = '';
let csrfToken = '';
let createdProductId = '';

function getSetCookies(response: { headers: Record<string, unknown> }) {
  const header = response.headers['set-cookie'];
  return Array.isArray(header) ? header.map(String) : typeof header === 'string' ? [header] : [];
}

function adminHeaders() {
  return {
    Cookie: `${adminCookie}; togoshol_admin_csrf=${csrfToken}`,
    'X-TOGOSHOL-Admin': '1',
    'X-CSRF-Token': csrfToken,
  };
}

function multipartImageBody() {
  const boundary = `----togoshol-${Date.now()}`;
  const png = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=',
    'base64',
  );
  const head = Buffer.from(
    `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="pixel.png"\r\nContent-Type: image/png\r\n\r\n`,
    'utf8',
  );
  const tail = Buffer.from(`\r\n--${boundary}--\r\n`, 'utf8');
  return {
    boundary,
    payload: Buffer.concat([head, png, tail]),
  };
}

before(async () => {
  await app.ready();
});

after(async () => {
  await app.close();
  await prisma.$disconnect();
  await fs.rm(tempDir, { recursive: true, force: true });
});

test('health endpoint responds', async () => {
  const response = await app.inject({ method: 'GET', url: '/api/health' });
  assert.equal(response.statusCode, 200);
  assert.equal(response.json().ok, true);
  assert.equal(response.headers['cache-control'], 'no-store');
});

test('admin login creates an http-only session cookie', async () => {
  const response = await app.inject({
    method: 'POST',
    url: '/api/admin/login',
    headers: { 'X-TOGOSHOL-Admin': '1' },
    payload: { password: '1111000010' },
  });

  assert.equal(response.statusCode, 200);
  assert.equal(response.json().ok, true);

  const cookies = getSetCookies(response);
  const sessionCookie = cookies.find((cookie) => cookie.startsWith('togoshol_admin_session='));
  const csrfCookie = cookies.find((cookie) => cookie.startsWith('togoshol_admin_csrf='));
  assert.equal(typeof sessionCookie, 'string');
  assert.equal(typeof csrfCookie, 'string');
  assert.match(sessionCookie, /HttpOnly/);
  adminCookie = sessionCookie.split(';')[0];
  csrfToken = csrfCookie.split(';')[0].split('=')[1] || '';
  assert.ok(csrfToken.length > 20);
});

test('public products are empty before admin creates a product', async () => {
  const response = await app.inject({ method: 'GET', url: '/api/products' });
  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json().items, []);
});

test('admin can create a product and storefront can read it', async () => {
  const createResponse = await app.inject({
    method: 'POST',
    url: '/api/admin/products',
    headers: adminHeaders(),
    payload: {
      title: 'Smoke Test PC',
      slug: 'smoke-test-pc',
      status: 'available',
      badge: 'В наличии',
      badgeType: 'available',
      price: 99900,
      priceText: '99 900 ₽',
      cpu: 'Ryzen 5',
      gpu: 'RTX 4070',
      ram: '32GB',
      storage: '1TB SSD',
      psu: '650W',
      productClass: 'qhd',
    },
  });

  assert.equal(createResponse.statusCode, 201);
  assert.equal(createResponse.json().item.title, 'Smoke Test PC');
  createdProductId = createResponse.json().item.id;

  const listResponse = await app.inject({ method: 'GET', url: '/api/products' });
  assert.equal(listResponse.statusCode, 200);
  assert.equal(listResponse.json().items.length, 1);
  assert.equal(listResponse.json().items[0].slug, 'smoke-test-pc');
});

test('patching only a product image preserves all other product fields', async () => {
  const beforeResponse = await app.inject({ method: 'GET', url: `/api/products/${createdProductId}` });
  const before = beforeResponse.json().item;

  const patchResponse = await app.inject({
    method: 'PATCH',
    url: `/api/admin/products/${createdProductId}`,
    headers: adminHeaders(),
    payload: { imageUrl: '/uploads/replacement.webp' },
  });

  assert.equal(patchResponse.statusCode, 200);
  const after = patchResponse.json().item;
  assert.equal(after.imageUrl, '/uploads/replacement.webp');
  assert.equal(after.title, before.title);
  assert.equal(after.price, before.price);
  assert.equal(after.cpu, before.cpu);
  assert.equal(after.gpu, before.gpu);
  assert.equal(after.ram, before.ram);
  assert.equal(after.storage, before.storage);
  assert.equal(after.productClass, before.productClass);
  assert.equal(after.sourceType, before.sourceType);
  assert.equal(after.sortOrder, before.sortOrder);
});

test('duplicate product slug returns conflict instead of server error', async () => {
  const response = await app.inject({
    method: 'POST',
    url: '/api/admin/products',
    headers: adminHeaders(),
    payload: {
      title: 'Duplicate Smoke Test PC',
      slug: 'smoke-test-pc',
      status: 'available',
      price: 109900,
      priceText: '109 900 ₽',
    },
  });

  assert.equal(response.statusCode, 409);
  assert.equal(response.json().ok, false);
});

test('page blocks, featured ranking and published products stay synchronized', async () => {
  const saveBlocksResponse = await app.inject({
    method: 'PATCH',
    url: '/api/admin/page-blocks',
    headers: adminHeaders(),
    payload: {
      heroProductIds: [createdProductId],
      featuredProductIds: [createdProductId],
      finalCtaProductIds: [createdProductId],
    },
  });
  assert.equal(saveBlocksResponse.statusCode, 200);

  const blocksResponse = await app.inject({ method: 'GET', url: '/api/page-blocks' });
  assert.equal(blocksResponse.statusCode, 200);
  assert.deepEqual(blocksResponse.json().blocks, {
    heroProductIds: [createdProductId],
    featuredProductIds: [createdProductId],
    finalCtaProductIds: [createdProductId],
  });
  assert.equal(blocksResponse.json().products.hero[0].id, createdProductId);
  assert.equal(blocksResponse.json().products.featured[0].id, createdProductId);
  assert.equal(blocksResponse.json().products.finalCta[0].id, createdProductId);

  const productsResponse = await app.inject({ method: 'GET', url: '/api/products' });
  assert.equal(productsResponse.json().items[0].isFeatured, true);
  assert.equal(productsResponse.json().items[0].featuredSlot, 0);

  const archiveResponse = await app.inject({
    method: 'DELETE',
    url: `/api/admin/products/${createdProductId}`,
    headers: adminHeaders(),
  });
  assert.equal(archiveResponse.statusCode, 200);

  const prunedBlocksResponse = await app.inject({ method: 'GET', url: '/api/page-blocks' });
  assert.deepEqual(prunedBlocksResponse.json().blocks, {
    heroProductIds: [],
    featuredProductIds: [],
    finalCtaProductIds: [],
  });
  assert.deepEqual(prunedBlocksResponse.json().products, { hero: [], featured: [], finalCta: [] });

  const publishedProductsResponse = await app.inject({ method: 'GET', url: '/api/products' });
  assert.deepEqual(publishedProductsResponse.json().items, []);
});

test('admin audit log records successful admin writes', async () => {
  const response = await app.inject({
    method: 'GET',
    url: '/api/admin/audit-logs',
    headers: { Cookie: adminCookie },
  });

  assert.equal(response.statusCode, 200);
  const items = response.json().items as Array<{ action: string; target: string }>;
  assert.ok(items.some((item) => item.action === 'POST /api/admin/products' && item.target === 'products'));
});

test('admin upload pipeline creates webp media entries that can be deleted', async () => {
  const body = multipartImageBody();
  const uploadResponse = await app.inject({
    method: 'POST',
    url: '/api/admin/uploads/images',
    headers: {
      ...adminHeaders(),
      'Content-Type': `multipart/form-data; boundary=${body.boundary}`,
    },
    payload: body.payload,
  });

  assert.equal(uploadResponse.statusCode, 201);
  const uploaded = uploadResponse.json() as { name: string; url: string; thumbUrl: string };
  assert.match(uploaded.name, /\.webp$/);
  assert.match(uploaded.url, /^\/uploads\//);
  assert.match(uploaded.thumbUrl, /-thumb\.webp$/);

  const listResponse = await app.inject({
    method: 'GET',
    url: '/api/admin/uploads/images',
    headers: { Cookie: adminHeaders().Cookie },
  });
  assert.equal(listResponse.statusCode, 200);
  assert.ok((listResponse.json().items as Array<{ name: string }>).some((item) => item.name === uploaded.name));

  const deleteResponse = await app.inject({
    method: 'DELETE',
    url: `/api/admin/uploads/images/${uploaded.name}`,
    headers: adminHeaders(),
  });
  assert.equal(deleteResponse.statusCode, 200);
  assert.equal(deleteResponse.json().ok, true);
});

test('public request endpoint stores a customer request', async () => {
  const response = await app.inject({
    method: 'POST',
    url: '/api/requests',
    payload: {
      source: 'configurator',
      contact: '@client',
      contactType: 'telegram',
      budget: 120000,
      message: 'Need a PC',
      pagePath: '/',
    },
  });

  assert.equal(response.statusCode, 201);
  assert.equal(response.json().ok, true);
  assert.equal(typeof response.json().requestId, 'string');
});
