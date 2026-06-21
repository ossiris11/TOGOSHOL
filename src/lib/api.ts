import type { Build } from '../data/builds';

export type ApiProduct = {
  id: string;
  slug: string;
  title: string;
  status: string;
  badge: string;
  badgeType?: 'default' | 'available';
  price: number;
  priceText: string;
  oldPrice?: number | null;
  imageUrl?: string | null;
  image?: string | null;
  gallery?: string[];
  cpu?: string;
  gpu?: string;
  ram?: string;
  storage?: string;
  psu?: string;
  cooling?: string;
  caseName?: string;
  description?: string;
  shortDescription?: string;
  specs?: string[];
  productClass?: 'fullhd' | 'qhd' | 'top' | 'work' | 'custom';
  scenario?: string;
  sourceType?: string;
  externalId?: string | null;
  sortOrder?: number;
  isFeatured?: boolean;
  featuredSlot?: number | null;
};

export type ApiReview = {
  id: string;
  authorName: string;
  rating: number;
  text: string;
  imageUrl?: string | null;
  source: string;
  externalUrl?: string | null;
};

export type StorefrontBlocks = {
  heroProductIds: string[];
  featuredProductIds: string[];
  finalCtaProductIds: string[];
};

export type ComponentOption = {
  id: string;
  category: 'cpu' | 'gpu' | 'motherboard' | 'ram' | 'storage' | 'psu' | 'cooling' | 'case' | 'os' | 'service';
  title: string;
  subtitle: string;
  price: number;
  wattage: number;
  tags: string[];
  status: string;
  sortOrder: number;
  description: string;
};

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    cache: 'no-store',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
    ...options,
  });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return response.json() as Promise<T>;
}

export function apiProductToBuild(product: ApiProduct): Build {
  const specs = product.specs?.length
    ? product.specs
    : [product.cpu, product.gpu, product.ram, product.storage, product.psu].filter((value): value is string => Boolean(value));

  return {
    badge: product.badge || (product.status === 'preorder' ? 'Под заказ' : 'В наличии'),
    badgeType: product.badgeType || (product.status === 'available' ? 'available' : 'default'),
    title: product.title,
    subtitle: specs.slice(0, 2).join(' / ') || 'Конфигурация TOGOSHOL',
    specs,
    price: product.priceText || new Intl.NumberFormat('ru-RU').format(product.price) + ' ₽',
    cta: 'Написать',
    sourceId: product.id,
    slug: product.slug,
    image: product.imageUrl || product.image || undefined,
    gallery: product.gallery || [],
    oldPrice: product.oldPrice ?? null,
    cpu: product.cpu || '',
    gpu: product.gpu || '',
    ram: product.ram || '',
    storage: product.storage || '',
    psu: product.psu || '',
    cooling: product.cooling || '',
    caseName: product.caseName || '',
    description: product.description || '',
    shortDescription: product.shortDescription || '',
    productClass: product.productClass || 'custom',
    scenario: product.scenario || '',
    sortOrder: product.sortOrder,
    isFeatured: product.isFeatured,
    featuredSlot: product.featuredSlot,
  };
}

export async function fetchProducts() {
  const payload = await fetchJson<{ ok: boolean; items: ApiProduct[] }>('/api/products');
  return payload.items.map(apiProductToBuild);
}

export async function fetchPageBlocks() {
  return fetchJson<{
    ok: boolean;
    blocks: StorefrontBlocks;
    products: { hero: ApiProduct[]; featured: ApiProduct[]; finalCta: ApiProduct[] };
  }>('/api/page-blocks');
}

export async function fetchReviews() {
  const payload = await fetchJson<{ ok: boolean; items: ApiReview[] }>('/api/reviews');
  return payload.items;
}

export async function fetchCustomComponents() {
  const payload = await fetchJson<{ ok: boolean; items: ComponentOption[] }>('/api/custom-components');
  return payload.items;
}

export async function createCustomerRequest(payload: Record<string, unknown>) {
  return fetchJson<{ ok: boolean; requestId: string }>('/api/requests', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function trackEvent(type: string, meta: Record<string, unknown> = {}) {
  const body = JSON.stringify({
    type,
    pagePath: window.location.pathname + window.location.hash,
    productId: typeof meta.productId === 'string' ? meta.productId : undefined,
    meta,
  });

  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/metrics/events', new Blob([body], { type: 'application/json' }));
    return;
  }

  fetch('/api/metrics/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true,
  }).catch(() => undefined);
}
