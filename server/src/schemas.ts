import { z } from 'zod';

const productFields = {
  title: z.string().trim().min(2).max(160),
  slug: z.string().trim().min(2).max(180).optional(),
  status: z.enum(['available', 'preorder', 'hidden', 'archived']),
  badge: z.string().trim().max(40),
  badgeType: z.enum(['default', 'available']),
  price: z.number().int().min(0).max(20_000_000),
  priceText: z.string().trim().max(40).optional(),
  oldPrice: z.number().int().min(0).max(20_000_000).nullable().optional(),
  imageUrl: z.string().trim().max(1200).nullable().optional(),
  gallery: z.array(z.string().trim().max(1200)).max(12),
  cpu: z.string().trim().max(120),
  gpu: z.string().trim().max(120),
  ram: z.string().trim().max(120),
  storage: z.string().trim().max(120),
  psu: z.string().trim().max(120),
  cooling: z.string().trim().max(120),
  caseName: z.string().trim().max(120),
  description: z.string().trim().max(4000),
  shortDescription: z.string().trim().max(500),
  specs: z.array(z.string().trim().max(240)).max(20),
  productClass: z.enum(['fullhd', 'qhd', 'top', 'work', 'custom']),
  scenario: z.string().trim().max(160),
  sortOrder: z.number().int().min(0).max(100000),
  isFeatured: z.boolean(),
  heroSlot: z.number().int().min(0).max(20).nullable().optional(),
  featuredSlot: z.number().int().min(0).max(20).nullable().optional(),
  sourceType: z.enum(['manual', 'vk_import']),
  externalId: z.string().trim().max(120).nullable().optional(),
};

export const productInputSchema = z.object({
  ...productFields,
  status: productFields.status.default('available'),
  badge: productFields.badge.default('В наличии'),
  badgeType: productFields.badgeType.default('available'),
  price: productFields.price.default(0),
  gallery: productFields.gallery.default([]),
  cpu: productFields.cpu.default(''),
  gpu: productFields.gpu.default(''),
  ram: productFields.ram.default(''),
  storage: productFields.storage.default(''),
  psu: productFields.psu.default(''),
  cooling: productFields.cooling.default(''),
  caseName: productFields.caseName.default(''),
  description: productFields.description.default(''),
  shortDescription: productFields.shortDescription.default(''),
  specs: productFields.specs.default([]),
  productClass: productFields.productClass.default('custom'),
  scenario: productFields.scenario.default(''),
  sortOrder: productFields.sortOrder.default(1000),
  isFeatured: productFields.isFeatured.default(false),
  sourceType: productFields.sourceType.default('manual'),
});

export const productPatchSchema = z.object(productFields).partial();

export const requestInputSchema = z.object({
  source: z.enum(['product', 'configurator', 'final_cta', 'contact']).default('contact'),
  name: z.string().trim().max(120).default(''),
  contact: z.string().trim().min(2).max(160),
  contactType: z.string().trim().max(40).default('unknown'),
  message: z.string().trim().max(4000).default(''),
  budget: z.number().int().min(0).max(20_000_000).nullable().optional(),
  game: z.string().trim().max(120).nullable().optional(),
  resolution: z.string().trim().max(40).nullable().optional(),
  partsCondition: z.string().trim().max(80).nullable().optional(),
  ram: z.string().trim().max(80).nullable().optional(),
  storage: z.string().trim().max(80).nullable().optional(),
  productId: z.string().trim().max(120).nullable().optional(),
  utmSource: z.string().trim().max(120).nullable().optional(),
  utmMedium: z.string().trim().max(120).nullable().optional(),
  utmCampaign: z.string().trim().max(120).nullable().optional(),
  pagePath: z.string().trim().max(500).nullable().optional(),
});

export const requestStatusSchema = z.object({
  status: z.enum(['new', 'in_progress', 'done', 'spam', 'archived']),
});

const reviewFields = {
  status: z.enum(['pending', 'published', 'rejected', 'hidden']),
  authorName: z.string().trim().min(2).max(120),
  authorLink: z.string().trim().max(1200).nullable().optional(),
  rating: z.number().int().min(1).max(5),
  text: z.string().trim().min(4).max(3000),
  imageUrl: z.string().trim().max(1200).nullable().optional(),
  source: z.enum(['manual', 'vk', 'telegram', 'avito', 'site', 'screenshot']),
  externalUrl: z.string().trim().max(1200).nullable().optional(),
  externalId: z.string().trim().max(120).nullable().optional(),
  productId: z.string().trim().max(120).nullable().optional(),
  sortOrder: z.number().int().min(0).max(100000),
  isPinned: z.boolean(),
};

export const reviewInputSchema = z.object({
  ...reviewFields,
  status: reviewFields.status.default('pending'),
  rating: reviewFields.rating.default(5),
  source: reviewFields.source.default('manual'),
  sortOrder: reviewFields.sortOrder.default(1000),
  isPinned: reviewFields.isPinned.default(false),
});

export const reviewPatchSchema = z.object(reviewFields).partial();

export const metricEventSchema = z.object({
  type: z.enum([
    'page_view',
    'product_view',
    'product_cta_click',
    'contact_click_vk',
    'contact_click_telegram',
    'contact_click_instagram',
    'contact_click_avito',
    'contact_click_max',
    'configurator_submit',
    'custom_pc_modal_open',
    'request_created',
    'product_details_click',
    'review_seen',
  ]),
  pagePath: z.string().trim().max(500).nullable().optional(),
  productId: z.string().trim().max(120).nullable().optional(),
  requestId: z.string().trim().max(120).nullable().optional(),
  meta: z.record(z.string(), z.unknown()).default({}),
});

export const pageBlocksSchema = z.object({
  heroProductIds: z.array(z.string()).max(6).default([]),
  featuredProductIds: z.array(z.string()).max(12).default([]),
  finalCtaProductIds: z.array(z.string()).max(3).default([]),
});

const componentOptionFields = {
  category: z.enum(['cpu', 'gpu', 'motherboard', 'ram', 'storage', 'psu', 'cooling', 'case', 'os', 'service']),
  title: z.string().trim().min(2).max(180),
  subtitle: z.string().trim().max(240),
  price: z.number().int().min(0).max(5_000_000),
  wattage: z.number().int().min(0).max(1500),
  tags: z.array(z.string().trim().max(40)).max(12),
  status: z.enum(['available', 'hidden', 'archived']),
  sortOrder: z.number().int().min(0).max(100000),
  description: z.string().trim().max(1200),
};

export const componentOptionSchema = z.object({
  ...componentOptionFields,
  subtitle: componentOptionFields.subtitle.default(''),
  price: componentOptionFields.price.default(0),
  wattage: componentOptionFields.wattage.default(0),
  tags: componentOptionFields.tags.default([]),
  status: componentOptionFields.status.default('available'),
  sortOrder: componentOptionFields.sortOrder.default(1000),
  description: componentOptionFields.description.default(''),
});

export const componentOptionPatchSchema = z.object(componentOptionFields).partial();
