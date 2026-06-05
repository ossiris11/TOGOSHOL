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
    return { badge: 'AMD', intro: 'AMD', brand: 'amd' as const };
  }

  if (/intel|core|celeron|pentium|\bi[3579][-\s]?\d/i.test(cpu)) {
    return { badge: 'intel', intro: 'Intel', brand: 'intel' as const };
  }

  return { badge: 'CPU', intro: 'CPU', brand: 'cpu' as const };
}

function ProcessorBrandLogo({ brand, label }: { brand: 'amd' | 'intel' | 'cpu'; label: string }) {
  if (brand === 'intel') {
    return (
      <span className="productBrandBadge isIntel" aria-label="Intel">
        <svg className="productBrandLogo productBrandLogo-intel" viewBox="0 0 86 32" aria-hidden="true" focusable="false">
          <path d="M10.9 10.2h5.2v15.6h-5.2V10.2Zm.2-6h5v4h-5v-4Zm9 10.7c0-3.1 1.9-4.9 5.2-4.9 3.7 0 5.9 2.2 5.9 6.3v9.5h-5.1v-8.7c0-1.7-.7-2.6-2-2.6-1.4 0-2.1 1-2.1 2.8v8.5h-5V10.2h4.6l.5 4.7Zm16.1-9.4h5.1v4.7h4.1v4.1h-4.1v6.2c0 1.1.5 1.6 1.5 1.6h2v4.1c-.9.2-1.8.3-2.8.3-4.1 0-6-1.9-6-5.7v-6.5h-2.7v-4.1h2.9V5.5Zm22.7 20.7c-5.7 0-9.1-3.1-9.1-8.2 0-5 3.1-8.1 8.2-8.1 4.9 0 7.7 3 7.7 8.4 0 .5 0 1-.1 1.4H55c.5 1.6 1.9 2.4 4.1 2.4 1.8 0 3.4-.4 4.9-1.1v4.1c-1.5.8-3.2 1.2-5.1 1.2Zm-4-9.5h5.9c-.1-1.8-1.1-2.8-2.8-2.8-1.6 0-2.7 1-3.1 2.8Zm13.7-11.9h5.1v21h-5.1v-21Z" />
          <circle cx="81" cy="23.3" r="2.7" />
        </svg>
      </span>
    );
  }

  if (brand === 'amd') {
    return (
      <span className="productBrandBadge isAmd" aria-label="AMD">
        <svg className="productBrandLogo productBrandLogo-amd" viewBox="0 0 92 32" aria-hidden="true" focusable="false">
          <path d="M4 25.8 11.3 6h6.1l7.3 19.8h-5.6l-1.2-3.7h-8l-1.2 3.7H4Zm7.4-8.1h6.2l-3.1-9.1-3.1 9.1Zm27.4 8.1-6.5-12.9v12.9h-5.1V6h6.8l6.1 12.4L46.2 6h6.8v19.8h-5.1V12.9l-6.4 12.9h-2.7Zm19.2 0V6h8.1c6.6 0 10.3 3.6 10.3 9.9 0 6.3-3.8 9.9-10.3 9.9H58Zm5.3-4.7h2.5c3.5 0 5.2-1.7 5.2-5.2s-1.7-5.2-5.2-5.2h-2.5v10.4Z" />
          <path d="M74.9 6H88v13.1h-4.7v-5.2l-7.1 7.1-3.3-3.3 7.1-7.1h-5.1V6Z" />
        </svg>
      </span>
    );
  }

  return <span className="productBrandBadge isNeutral">{label}</span>;
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
                  <ProcessorBrandLogo brand={processorBrand.brand} label={processorBrand.badge} />
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
