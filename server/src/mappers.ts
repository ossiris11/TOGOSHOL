import type { Product, Review } from '@prisma/client';
import { parseJsonArray } from './http.js';

export function formatRub(value: number) {
  return new Intl.NumberFormat('ru-RU').format(value) + ' ₽';
}

export function slugify(value: string) {
  const normalized = value
    .toLowerCase()
    .replace(/ё/g, 'e')
    .replace(/[^a-z0-9а-я]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90);
  return normalized || `product-${Date.now()}`;
}

export function mapProduct(product: Product) {
  return {
    id: product.id,
    title: product.title,
    slug: product.slug,
    status: product.status,
    badge: product.badge,
    badgeType: product.badgeType,
    price: product.price,
    priceText: product.priceText,
    oldPrice: product.oldPrice,
    imageUrl: product.imageUrl,
    image: product.imageUrl,
    gallery: parseJsonArray(product.galleryJson),
    cpu: product.cpu,
    gpu: product.gpu,
    ram: product.ram,
    storage: product.storage,
    psu: product.psu,
    cooling: product.cooling,
    caseName: product.caseName,
    description: product.description,
    shortDescription: product.shortDescription,
    specs: parseJsonArray(product.specsJson),
    productClass: product.productClass,
    scenario: product.scenario,
    sortOrder: product.sortOrder,
    isFeatured: product.isFeatured,
    heroSlot: product.heroSlot,
    featuredSlot: product.featuredSlot,
    sourceType: product.sourceType,
    externalId: product.externalId,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
    deletedAt: product.deletedAt?.toISOString() || null,
  };
}

export function mapReview(review: Review) {
  return {
    id: review.id,
    status: review.status,
    authorName: review.authorName,
    authorLink: review.authorLink,
    rating: review.rating,
    text: review.text,
    imageUrl: review.imageUrl,
    source: review.source,
    externalUrl: review.externalUrl,
    externalId: review.externalId,
    productId: review.productId,
    sortOrder: review.sortOrder,
    isPinned: review.isPinned,
    createdAt: review.createdAt.toISOString(),
    updatedAt: review.updatedAt.toISOString(),
    publishedAt: review.publishedAt?.toISOString() || null,
  };
}

export function productInputToDb(input: Record<string, unknown>) {
  const copy = { ...input };
  if (Array.isArray(copy.gallery)) {
    copy.galleryJson = JSON.stringify(copy.gallery);
    delete copy.gallery;
  }
  if (Array.isArray(copy.specs)) {
    copy.specsJson = JSON.stringify(copy.specs);
    delete copy.specs;
  }
  if (typeof copy.price === 'number' && !copy.priceText) {
    copy.priceText = formatRub(copy.price);
  }
  return copy;
}
