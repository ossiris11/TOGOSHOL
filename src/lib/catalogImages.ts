import budgetPc01 from '../assets/catalog-pc-budget-01-cutout.webp';
import budgetPc02 from '../assets/catalog-pc-budget-02-cutout.webp';
import budgetPc03 from '../assets/catalog-pc-budget-03-cutout.webp';
import budgetPc04 from '../assets/catalog-pc-budget-04-cutout.webp';
import budgetPc05 from '../assets/catalog-pc-budget-05-cutout.webp';
import budgetPc06 from '../assets/catalog-pc-budget-06-cutout.webp';
import budgetPc07 from '../assets/catalog-pc-budget-07-cutout.webp';
import premiumPc01 from '../assets/catalog-pc-premium-01-cutout.webp';
import premiumPc02 from '../assets/catalog-pc-premium-02-cutout.webp';
import premiumPc03 from '../assets/catalog-pc-premium-03-cutout.webp';
import premiumPc04 from '../assets/catalog-pc-premium-04-cutout.webp';
import premiumPc05 from '../assets/catalog-pc-premium-05-cutout.webp';
import premiumPc06 from '../assets/catalog-pc-premium-06-cutout.webp';
import premiumPc07 from '../assets/catalog-pc-premium-07-cutout.webp';
import intelI513400fRtx5060White from '../assets/product-intel-i5-13400f-rtx5060-white-cutout.webp';

const budgetCatalogImages = [budgetPc01, budgetPc02, budgetPc03, budgetPc04, budgetPc05, budgetPc06, budgetPc07] as const;
const premiumCatalogImages = [premiumPc01, premiumPc02, premiumPc03, premiumPc04, premiumPc05, premiumPc06, premiumPc07] as const;

function getStableImageIndex(key: string, imageCount: number) {
  let hash = 0;
  for (const character of key) hash = Math.imul(hash, 31) + character.charCodeAt(0) | 0;
  return Math.abs(hash) % imageCount;
}

export function isLegacyProductImage(image: string | null | undefined) {
  return Boolean(image && /https?:\/\/sun\d+-\d+\./i.test(image));
}

export function getCatalogFallbackImage(priceValue: number, stableKey: string) {
  if (priceValue === 105_000 && /i5[-\s]?13400f.*rtx\s?5060/i.test(stableKey)) return intelI513400fRtx5060White;

  const images = priceValue <= 90_000 ? budgetCatalogImages : premiumCatalogImages;
  return images[getStableImageIndex(stableKey, images.length)];
}

export function resolveCatalogProductImage(image: string | null | undefined, priceValue: number, stableKey: string) {
  if (image && !isLegacyProductImage(image)) return image;
  return getCatalogFallbackImage(priceValue, stableKey);
}
