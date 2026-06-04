import type { Build } from '../data/builds';

export type ProductDetails = {
  cpu: string;
  gpu: string;
  ram: string;
  storage: string;
  psu: string;
};

export type ProductView = Build & {
  cleanSpecs: string[];
  details: ProductDetails;
  priceValue: number;
  normalizedTitle: string;
};

const emptyDetails: ProductDetails = {
  cpu: '',
  gpu: '',
  ram: '',
  storage: '',
  psu: '',
};

function cleanText(value: string) {
  return value
    .replace(/\s+/g, ' ')
    .replace(/Kомпьютep/g, 'Компьютер')
    .replace(/Пpоцесcoр/g, 'Процессор')
    .replace(/Oтличнo/g, 'Отлично')
    .trim();
}

export function parsePriceValue(price: string) {
  const digits = price.replace(/[^\d]/g, '');
  return digits ? Number(digits) : 0;
}

function findSpec(specs: string[], patterns: RegExp[]) {
  const match = specs.find((spec) => patterns.some((pattern) => pattern.test(spec)));
  if (!match) return '';
  const [, value = match] = match.split(':');
  return cleanText(value);
}

export function getProductDetails(product: Build): ProductDetails {
  const specs = product.specs.map(cleanText);

  return {
    cpu: findSpec(specs, [/процессор/i, /\bcpu\b/i]) || extractFromTitle(product.title, /(Ryzen\s?\d\s?\w*|R\d\s?\d+|i[3579][-\s]?\d+\w*)/i),
    gpu:
      findSpec(specs, [/видеокарта/i, /\bgpu\b/i]) ||
      extractFromTitle(product.title, /(RTX\s?\d+\s?(?:Ti|Super)?|RX\s?\d+\s?XT?|GTX\s?\d+)/i),
    ram: findSpec(specs, [/оператив/i, /\bram\b/i]) || extractFromTitle(product.title, /(\d+\s?GB(?:\s?DDR[45])?)/i),
    storage: findSpec(specs, [/накопитель/i, /\bssd\b/i]) || '',
    psu: findSpec(specs, [/блок питания/i, /\bpsu\b/i]) || '',
  };
}

function extractFromTitle(title: string, pattern: RegExp) {
  return cleanText(title.match(pattern)?.[0] || '');
}

export function getCleanSpecs(product: Build) {
  const details = getProductDetails(product);
  const specs = [details.cpu, details.gpu, details.ram, details.storage, details.psu]
    .filter(Boolean)
    .map(cleanText);

  if (specs.length >= 3) return specs.slice(0, 5);

  return product.specs
    .map(cleanText)
    .filter((spec) => spec && !/^конфигурация/i.test(spec) && !/напиши прямо сейчас/i.test(spec) && !/входит в стоимость/i.test(spec))
    .slice(0, 5);
}

export function normalizeProductTitle(product: Build) {
  const details = getProductDetails(product);
  const parts = [details.cpu, details.gpu, details.ram].filter(Boolean);

  if (parts.length >= 2) return parts.join(' / ');

  return cleanText(product.title)
    .replace(/^Игрвоой/i, 'Игровой')
    .replace(/\/+/g, ' / ');
}

export function toProductView(product: Build): ProductView {
  return {
    ...product,
    cleanSpecs: getCleanSpecs(product),
    details: { ...emptyDetails, ...getProductDetails(product) },
    priceValue: parsePriceValue(product.price),
    normalizedTitle: normalizeProductTitle(product),
  };
}

export function getProductViews(products: Build[]) {
  return products.map(toProductView).sort((a, b) => a.priceValue - b.priceValue);
}

export function getClosestProducts(products: Build[], budget: number, count = 3) {
  return getProductViews(products)
    .filter((product) => product.priceValue > 0)
    .sort((a, b) => Math.abs(a.priceValue - budget) - Math.abs(b.priceValue - budget))
    .slice(0, count);
}

export function getBudgetLabel(priceValue: number) {
  if (priceValue < 60000) return 'до 60k';
  if (priceValue < 90000) return '60–90k';
  if (priceValue < 150000) return '90–150k';
  return '150k+';
}
