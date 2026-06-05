import { z } from 'zod';

export const productInputSchema = z.object({
  title: z.string().trim().min(2).max(160),
  slug: z.string().trim().min(2).max(180).optional(),
  status: z.enum(['available', 'preorder', 'hidden', 'archived']).default('available'),
  badge: z.string().trim().max(40).default('В наличии'),
  badgeType: z.enum(['default', 'available']).default('available'),
  price: z.number().int().min(0).max(20_000_000).default(0),
  priceText: z.string().trim().max(40).optional(),
  oldPrice: z.number().int().min(0).max(20_000_000).nullable().optional(),
  imageUrl: z.string().trim().max(1200).nullable().optional(),
  gallery: z.array(z.string().trim().max(1200)).max(12).default([]),
  cpu: z.string().trim().max(120).default(''),
  gpu: z.string().trim().max(120).default(''),
  ram: z.string().trim().max(120).default(''),
  storage: z.string().trim().max(120).default(''),
  psu: z.string().trim().max(120).default(''),
  cooling: z.string().trim().max(120).default(''),
  caseName: z.string().trim().max(120).default(''),
  description: z.string().trim().max(4000).default(''),
  shortDescription: z.string().trim().max(500).default(''),
  specs: z.array(z.string().trim().max(240)).max(20).default([]),
  productClass: z.enum(['fullhd', 'qhd', 'top', 'work', 'custom']).default('custom'),
  scenario: z.string().trim().max(160).default(''),
  sortOrder: z.number().int().min(0).max(100000).default(1000),
  isFeatured: z.boolean().default(false),
  heroSlot: z.number().int().min(0).max(20).nullable().optional(),
  featuredSlot: z.number().int().min(0).max(20).nullable().optional(),
  sourceType: z.enum(['manual', 'vk_import']).default('manual'),
  externalId: z.string().trim().max(120).nullable().optional(),
});

export const productPatchSchema = productInputSchema.partial();

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

export const reviewInputSchema = z.object({
  status: z.enum(['pending', 'published', 'rejected', 'hidden']).default('pending'),
  authorName: z.string().trim().min(2).max(120),
  authorLink: z.string().trim().max(1200).nullable().optional(),
  rating: z.number().int().min(1).max(5).default(5),
  text: z.string().trim().min(4).max(3000),
  imageUrl: z.string().trim().max(1200).nullable().optional(),
  source: z.enum(['manual', 'vk', 'telegram', 'avito', 'screenshot']).default('manual'),
  externalUrl: z.string().trim().max(1200).nullable().optional(),
  externalId: z.string().trim().max(120).nullable().optional(),
  productId: z.string().trim().max(120).nullable().optional(),
  sortOrder: z.number().int().min(0).max(100000).default(1000),
  isPinned: z.boolean().default(false),
});

export const reviewPatchSchema = reviewInputSchema.partial();

export const metricEventSchema = z.object({
  type: z.enum([
    'page_view',
    'product_view',
    'product_cta_click',
    'contact_click_vk',
    'contact_click_telegram',
    'contact_click_max',
    'configurator_submit',
    'request_created',
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

export const componentOptionSchema = z.object({
  category: z.enum(['cpu', 'gpu', 'motherboard', 'ram', 'storage', 'psu', 'cooling', 'case', 'os', 'service']),
  title: z.string().trim().min(2).max(180),
  subtitle: z.string().trim().max(240).default(''),
  price: z.number().int().min(0).max(5_000_000).default(0),
  wattage: z.number().int().min(0).max(1500).default(0),
  tags: z.array(z.string().trim().max(40)).max(12).default([]),
  status: z.enum(['available', 'hidden', 'archived']).default('available'),
  sortOrder: z.number().int().min(0).max(100000).default(1000),
  description: z.string().trim().max(1200).default(''),
});

export const componentOptionPatchSchema = componentOptionSchema.partial();
