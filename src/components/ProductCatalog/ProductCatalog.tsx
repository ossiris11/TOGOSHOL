import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { buildContactMessage, contacts } from '../../data/contacts';
import { useProducts } from '../../hooks/useProducts';
import { trackEvent } from '../../lib/api';
import { getBudgetLabel, getProductKey, getProductViews } from '../../lib/products';
import type { ProductView } from '../../lib/products';
import heroPc from '../../assets/hero-pc.png';
import './ProductCatalog.css';

const filters = ['Все', 'до 60k', '60–90k', '90–150k', '150k+'] as const;
const specDrawerCloseMs = 420;

type Filter = (typeof filters)[number];

function getCardTitle(tier: string) {
  if (tier === 'Топ') return 'Ultra';
  if (tier === '2K') return 'Pro';
  if (tier === 'Full HD') return 'Start';
  return 'Custom';
}

function getProcessorBrand(cpu: string) {
  if (/ryzen|threadripper|\bamd\b/i.test(cpu)) {
    return { badge: 'AMD', intro: 'AMD', className: 'isAmd' };
  }

  if (/intel|core|celeron|pentium|\bi[3579][-\s]?\d/i.test(cpu)) {
    return { badge: 'intel.', intro: 'Intel', className: 'isIntel' };
  }

  return { badge: 'CPU', intro: 'CPU', className: 'isNeutral' };
}

function getFpsEstimate(priceValue: number, tier: string) {
  const base = tier === 'Топ' ? 170 : tier === '2K' ? 135 : tier === 'Full HD' ? 95 : 110;
  const budgetBoost = Math.min(45, Math.max(0, Math.round((priceValue - 65000) / 4500)));
  return Math.max(60, base + budgetBoost);
}

function getPerformanceLabel(tier: string) {
  if (tier === 'Топ') return '4K, стриминг и тяжелые проекты';
  if (tier === '2K') return 'Комфортный 2K и запас на апгрейд';
  if (tier === 'Full HD') return 'Full HD, киберспорт и учеба';
  return 'Под игры, работу и бюджет';
}

const specIcons: Record<string, string> = {
  GPU: '▣',
  CPU: '◈',
  RAM: '▤',
  SSD: '◎',
  PSU: '▥',
};

function getSpecValue(product: ProductView, patterns: RegExp[]) {
  const specs = [...product.cleanSpecs, ...product.specs];
  const match = specs.find((spec) => patterns.some((pattern) => pattern.test(spec)));
  if (!match) return 'На выбор';

  return match.split(':').slice(1).join(':').trim() || match.trim();
}

function getSpecificationRows(product: ProductView) {
  return [
    ['Видеокарта', product.details.gpu || getSpecValue(product, [/видеокарта/i, /\bgpu\b/i])],
    ['Процессор', product.details.cpu || getSpecValue(product, [/процессор/i, /\bcpu\b/i])],
    ['Материнская плата', getSpecValue(product, [/материн/i, /motherboard/i, /\b[abzhx]\d{3,4}\b/i, /\bh\d{3}\b/i])],
    ['Оперативная память', product.details.ram || getSpecValue(product, [/оператив/i, /\bram\b/i, /\bddr[45]\b/i])],
    ['SSD накопитель', product.details.storage || getSpecValue(product, [/накопитель/i, /\bssd\b/i])],
    ['Охлаждение', getSpecValue(product, [/охлаж/i, /cool/i, /\bсжо\b/i])],
    ['Блок питания', product.details.psu || getSpecValue(product, [/блок питания/i, /\bpsu\b/i])],
    ['Корпус', getSpecValue(product, [/корпус/i, /\bcase\b/i, /airflow/i, /frgb/i, /argb/i])],
  ];
}

function buildOrderText(product: ProductView) {
  const rows = getSpecificationRows(product)
    .map(([label, value]) => `${label}: ${value}`)
    .join('\n');

  return `— Заявка с сайта TOG PC —
Бюджет: ${product.price}
Сборка: TOG PC ${getCardTitle(product.gpuTier)}

— Конфигурация —
${rows}

Хочу оформить этот ПК.`;
}

export function ProductCatalog() {
  const [activeFilter, setActiveFilter] = useState<Filter>('Все');
  const [showAll, setShowAll] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductView | null>(null);
  const [isSpecClosing, setIsSpecClosing] = useState(false);
  const closeSpecTimer = useRef<number | null>(null);
  const productSpecDrawerRef = useRef<HTMLElement | null>(null);
  const lastFocusedElementRef = useRef<HTMLElement | null>(null);
  const { products: storefrontProducts } = useProducts();
  const products = useMemo(() => getProductViews(storefrontProducts), [storefrontProducts]);
  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => activeFilter === 'Все' || getBudgetLabel(product.priceValue) === activeFilter)
      .sort((a, b) => b.priceValue - a.priceValue);
  }, [activeFilter, products]);
  const visibleProducts = showAll ? filteredProducts : filteredProducts.slice(0, 9);

  const resetLimit = () => setShowAll(false);

  const openSpecDrawer = (product: ProductView) => {
    lastFocusedElementRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (closeSpecTimer.current) {
      window.clearTimeout(closeSpecTimer.current);
      closeSpecTimer.current = null;
    }

    setIsSpecClosing(false);
    setSelectedProduct(product);
  };

  const closeSpecDrawer = useCallback(() => {
    if (!selectedProduct || isSpecClosing) return;

    setIsSpecClosing(true);
    closeSpecTimer.current = window.setTimeout(() => {
      setSelectedProduct(null);
      setIsSpecClosing(false);
      closeSpecTimer.current = null;
      lastFocusedElementRef.current?.focus();
    }, specDrawerCloseMs);
  }, [isSpecClosing, selectedProduct]);

  useEffect(() => {
    if (!selectedProduct) return undefined;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeSpecDrawer();
      if (event.key !== 'Tab') return;

      const focusable = productSpecDrawerRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable || focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    window.setTimeout(() => productSpecDrawerRef.current?.querySelector<HTMLElement>('button, a')?.focus(), 0);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [closeSpecDrawer, selectedProduct]);

  useEffect(
    () => () => {
      if (closeSpecTimer.current) window.clearTimeout(closeSpecTimer.current);
    },
    [],
  );

  return (
    <section id="catalog" className="section productCatalog">
      <div className="container">
        <div className="catalogHeader" data-reveal>
          <h2 className="sectionTitle">Сборки TOGOSHOL</h2>
        </div>

        <div className="catalogFilters" aria-label="Фильтр по бюджету" data-reveal>
          <span>Бюджет</span>
          {filters.map((filter) => (
            <button
              className={activeFilter === filter ? 'isActive' : ''}
              key={filter}
              type="button"
              onClick={() => {
                setActiveFilter(filter);
                resetLimit();
              }}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="catalogGrid">
          {visibleProducts.map((product) => {
            const cardTitle = getCardTitle(product.gpuTier);
            const processorBrand = getProcessorBrand(product.details.cpu || product.normalizedTitle);
            const fps = getFpsEstimate(product.priceValue, product.gpuTier);
            const orderMessage = buildOrderText(product);
            const specs = [
              ['GPU', 'Видеокарта', product.details.gpu],
              ['CPU', 'Процессор', product.details.cpu],
              ['RAM', 'ОЗУ', product.details.ram],
              ['SSD', 'Накопитель', product.details.storage],
              ['PSU', 'Питание', product.details.psu],
            ].filter(([, , value]) => value);

            return (
              <article className="productCard" key={getProductKey(product)} data-reveal>
                <div className="productShowcase" aria-label={product.normalizedTitle}>
                  <span className={`productBrandBadge ${processorBrand.className}`}>{processorBrand.badge}</span>
                  <img
                    src={product.image || heroPc}
                    alt={product.normalizedTitle}
                    loading="lazy"
                    decoding="async"
                    onError={(event) => {
                      event.currentTarget.src = heroPc;
                    }}
                  />
                  <div className="productIntro">
                    <span>TOG PC ({processorBrand.intro})</span>
                    <h3>{cardTitle}</h3>
                    <p>
                      <small>от</small>
                      {product.price}
                    </p>
                  </div>
                </div>

                <div className="productInfo">
                  <div className="productMetaLine">
                    <span className={`productStatus ${product.badgeType === 'available' ? 'isAvailable' : ''}`}>{product.badge}</span>
                    <span>{product.useCase}</span>
                  </div>

                  <div className="productActions">
                    <a
                      className="productBuyButton"
                      href={`${contacts.vk}?message=${buildContactMessage(orderMessage)}`}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => trackEvent('product_cta_click', { productId: product.sourceId, title: product.normalizedTitle, channel: 'vk', placement: 'catalog_card' })}
                    >
                      Написать по сборке <span>→</span>
                    </a>
                    <a
                      className="productDetailsButton"
                      href={`#spec-${getProductKey(product)}`}
                      onClick={(event) => {
                        event.preventDefault();
                        openSpecDrawer(product);
                        trackEvent('product_details_click', { productId: product.sourceId, placement: 'catalog' });
                      }}
                    >
                      Подробнее о сборке <span>›</span>
                    </a>
                  </div>

                  <div className="productFpsBox">
                    <div className="fpsRing">
                      <strong>{fps}</strong>
                      <small>FPS</small>
                    </div>
                    <div>
                      <b>Показатели в играх</b>
                      <span>{getPerformanceLabel(product.gpuTier)}</span>
                    </div>
                  </div>

                  <dl className="productSpecsList">
                    {specs.map(([key, label, value]) => (
                      <div key={key}>
                        <span className="productSpecIcon" aria-hidden="true">
                          {specIcons[key] || '•'}
                        </span>
                        <dt>{label}</dt>
                        <dd>{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </article>
            );
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div className="catalogEmpty" data-reveal>
            <h3>Под такие параметры ничего не нашли</h3>
            <p>Напиши нам или открой конфигуратор — подберём сборку вручную под бюджет, игры и монитор.</p>
            <div>
              <a className="button buttonPrimary" href="#custom">
                Открыть конфигуратор
              </a>
              <a className="button buttonSecondary" href={contacts.vk} target="_blank" rel="noreferrer">
                Написать в VK
              </a>
            </div>
          </div>
        )}

        {visibleProducts.length < filteredProducts.length && (
          <button className="showMoreButton" type="button" onClick={() => setShowAll(true)}>
            Показать ещё {filteredProducts.length - visibleProducts.length}
          </button>
        )}
      </div>

      {selectedProduct && (
        <div
          className={`productSpecOverlay ${isSpecClosing ? 'isClosing' : ''}`}
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeSpecDrawer();
          }}
        >
          <aside ref={productSpecDrawerRef} className="productSpecDrawer" role="dialog" aria-modal="true" aria-labelledby="product-spec-title">
            <header className="productSpecHeader">
              <h3 id="product-spec-title">Спецификация {getCardTitle(selectedProduct.gpuTier)}</h3>
              <button type="button" className="productSpecClose" aria-label="Закрыть спецификацию" onClick={closeSpecDrawer}>
                ×
              </button>
            </header>

            <div className="productSpecBody">
              <span className="productSpecEyebrow">Комплектующие</span>
              <dl className="productSpecTable">
                {getSpecificationRows(selectedProduct).map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>

              <div className="productSpecActions">
                <a
                  className="productBuyButton"
                  href={`${contacts.vk}?message=${buildContactMessage(buildOrderText(selectedProduct))}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => trackEvent('product_cta_click', { productId: selectedProduct.sourceId, title: selectedProduct.normalizedTitle, channel: 'vk', placement: 'spec_drawer' })}
                >
                  Написать по сборке <span>→</span>
                </a>
                <a className="productDetailsButton" href={contacts.telegram} target="_blank" rel="noreferrer">
                  Telegram <span>›</span>
                </a>
              </div>
            </div>
          </aside>
        </div>
      )}

    </section>
  );
}
