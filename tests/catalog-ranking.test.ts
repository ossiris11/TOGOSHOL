import assert from 'node:assert/strict';
import test from 'node:test';
import { rankCatalogProducts } from '../src/lib/products';

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
