import assert from 'node:assert/strict';
import test from 'node:test';
import { rankCatalogProducts } from '../src/lib/products';
import { getProductBySlug, getProductSlug, toProductView } from '../src/lib/products';
import { apiProductToBuild, type ApiProduct } from '../src/lib/api';
import type { Build } from '../src/data/builds';

test('catalog leads with popular products from each price range, then keeps popularity order', () => {
  const products = [
    { id: 'premium-second', priceValue: 180_000, isFeatured: false, featuredSlot: null, sortOrder: 6 },
    { id: 'budget-lead', priceValue: 55_000, isFeatured: true, featuredSlot: 1, sortOrder: 8 },
    { id: 'middle-rest', priceValue: 75_000, isFeatured: false, featuredSlot: null, sortOrder: 4 },
    { id: 'upper-lead', priceValue: 110_000, isFeatured: true, featuredSlot: 2, sortOrder: 7 },
    { id: 'middle-lead', priceValue: 80_000, isFeatured: true, featuredSlot: 0, sortOrder: 9 },
    { id: 'premium-lead', priceValue: 220_000, isFeatured: false, featuredSlot: null, sortOrder: 3 },
    { id: 'budget-rest', priceValue: 49_000, isFeatured: false, featuredSlot: null, sortOrder: 5 },
  ];

  const ranked = rankCatalogProducts(products);

  assert.deepEqual(ranked.map((product) => product.id), [
    'middle-lead',
    'budget-lead',
    'upper-lead',
    'premium-lead',
    'middle-rest',
    'budget-rest',
    'premium-second',
  ]);
  assert.equal(new Set(ranked).size, products.length);
});

test('API slugs remain canonical while product IDs keep working as compatible routes', () => {
  const product: Build = {
    badge: 'В наличии',
    title: 'Test PC',
    subtitle: 'Test',
    specs: ['RTX 5060'],
    price: '100 000 ₽',
    cta: 'Написать',
    sourceId: 'database-id',
    slug: 'test-pc',
  };

  const view = getProductBySlug([product], 'test-pc');
  assert.ok(view);
  assert.equal(getProductSlug(view), 'test-pc');
  assert.equal(getProductBySlug([product], 'database-id')?.sourceId, 'database-id');
});

test('storefront mapping preserves product fields managed in the admin panel', () => {
  const apiProduct: ApiProduct = {
    id: 'product-id',
    slug: 'exact-pc',
    title: 'Exact Admin PC',
    status: 'available',
    badge: 'В наличии',
    badgeType: 'available',
    price: 150000,
    priceText: '150 000 ₽',
    oldPrice: 160000,
    imageUrl: '/uploads/exact.webp',
    gallery: ['/uploads/detail.webp'],
    cpu: 'Ryzen 7 7800X3D',
    gpu: 'RTX 5070',
    ram: '32GB DDR5',
    storage: 'SSD 1TB',
    psu: '850W',
    cooling: 'СЖО 240 мм',
    caseName: 'Аквариум RGB',
    description: 'Полное описание из админки',
    shortDescription: 'Короткое описание',
    specs: ['Ryzen 7 7800X3D', 'RTX 5070', '32GB DDR5'],
    productClass: 'top',
    scenario: '4K / монтаж',
    sortOrder: 32,
  };

  const build = apiProductToBuild(apiProduct);
  const view = toProductView(build);

  assert.equal(view.title, apiProduct.title);
  assert.equal(view.details.cooling, apiProduct.cooling);
  assert.equal(view.details.caseName, apiProduct.caseName);
  assert.equal(view.description, apiProduct.description);
  assert.equal(view.shortDescription, apiProduct.shortDescription);
  assert.equal(view.productClass, apiProduct.productClass);
  assert.equal(view.useCase, apiProduct.scenario);
  assert.equal(view.gpuTier, 'Топ');
  assert.deepEqual(view.gallery, apiProduct.gallery);
  assert.equal(view.oldPrice, apiProduct.oldPrice);
  assert.equal(view.sortOrder, apiProduct.sortOrder);
});
