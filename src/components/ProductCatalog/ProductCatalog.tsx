import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { buildContactMessage, contacts } from '../../data/contacts';
import { useProducts } from '../../hooks/useProducts';
import { trackEvent } from '../../lib/api';
import { getBudgetLabel, getProductKey, getProductSearchText, getProductViews } from '../../lib/products';
import type { ProductView } from '../../lib/products';
import heroPc from '../../assets/hero-pc.png';
import './ProductCatalog.css';

const filters = ['Все', 'до 60k', '60–90k', '90–150k', '150k+'] as const;
const gpuFilters = ['Все', 'Full HD', '2K', 'Топ', 'Работа'] as const;
const sortOptions = [
  { label: 'Рекомендуем', value: 'recommended' },
  { label: 'Сначала дешевле', value: 'price-asc' },
  { label: 'Сначала дороже', value: 'price-desc' },
  { label: 'Сначала мощнее', value: 'power-desc' },
] as const;
const specDrawerCloseMs = 420;
const checkoutCloseMs = 260;

type Filter = (typeof filters)[number];
type GpuFilter = (typeof gpuFilters)[number];
type SortOption = (typeof sortOptions)[number]['value'];

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
  const [activeGpuFilter, setActiveGpuFilter] = useState<GpuFilter>('Все');
  const [sortBy, setSortBy] = useState<SortOption>('recommended');
  const [query, setQuery] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductView | null>(null);
  const [isSpecClosing, setIsSpecClosing] = useState(false);
  const [checkoutProduct, setCheckoutProduct] = useState<ProductView | null>(null);
  const [isCheckoutClosing, setIsCheckoutClosing] = useState(false);
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle');
  const closeSpecTimer = useRef<number | null>(null);
  const closeCheckoutTimer = useRef<number | null>(null);
  const { products: storefrontProducts } = useProducts();
  const products = useMemo(() => getProductViews(storefrontProducts), [storefrontProducts]);
  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return products
      .filter((product) => activeFilter === 'Все' || getBudgetLabel(product.priceValue) === activeFilter)
      .filter((product) => activeGpuFilter === 'Все' || product.gpuTier === activeGpuFilter || (activeGpuFilter === 'Работа' && /монтаж|работ|3d|ai/i.test(product.useCase)))
      .filter((product) => !normalizedQuery || getProductSearchText(product).includes(normalizedQuery))
      .sort((a, b) => {
        if (sortBy === 'price-desc') return b.priceValue - a.priceValue;
        if (sortBy === 'power-desc') return b.priceValue - a.priceValue;
        if (sortBy === 'recommended') return b.priceValue - a.priceValue;
        return a.priceValue - b.priceValue;
      });
  }, [activeFilter, activeGpuFilter, products, query, sortBy]);
  const visibleProducts = showAll ? filteredProducts : filteredProducts.slice(0, 9);
  const minPrice = products[0]?.price || 'по запросу';

  const resetLimit = () => setShowAll(false);

  const openSpecDrawer = (product: ProductView) => {
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
    }, specDrawerCloseMs);
  }, [isSpecClosing, selectedProduct]);

  const openCheckout = (product: ProductView) => {
    if (closeCheckoutTimer.current) {
      window.clearTimeout(closeCheckoutTimer.current);
      closeCheckoutTimer.current = null;
    }

    setCopyState('idle');
    setIsCheckoutClosing(false);
    setCheckoutProduct(product);
    trackEvent('product_cta_click', { productId: product.sourceId, title: product.normalizedTitle, channel: 'checkout_modal', placement: 'catalog' });
  };

  const closeCheckout = useCallback(() => {
    if (!checkoutProduct || isCheckoutClosing) return;

    setIsCheckoutClosing(true);
    closeCheckoutTimer.current = window.setTimeout(() => {
      setCheckoutProduct(null);
      setIsCheckoutClosing(false);
      setCopyState('idle');
      closeCheckoutTimer.current = null;
    }, checkoutCloseMs);
  }, [checkoutProduct, isCheckoutClosing]);

  const copyCheckoutText = async () => {
    if (!checkoutProduct) return;

    try {
      await navigator.clipboard.writeText(buildOrderText(checkoutProduct));
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1600);
    } catch {
      setCopyState('idle');
    }
  };

  useEffect(() => {
    if (!selectedProduct && !checkoutProduct) return;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeSpecDrawer();
      if (event.key === 'Escape') closeCheckout();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [checkoutProduct, closeCheckout, closeSpecDrawer, selectedProduct]);

  useEffect(
    () => () => {
      if (closeSpecTimer.current) window.clearTimeout(closeSpecTimer.current);
      if (closeCheckoutTimer.current) window.clearTimeout(closeCheckoutTimer.current);
    },
    [],
  );

  return (
    <section id="catalog" className="section productCatalog">
      <div className="container">
        <div className="catalogHeader" data-reveal>
          <div>
            <span className="badge">Каталог сборок</span>
            <h2 className="sectionTitle">Все сборки TOGOSHOL</h2>
            <p className="sectionText">
              Актуальные сборки TOGOSHOL: цены, фото и конфигурации. Выбери бюджет или напиши по конкретной сборке.
            </p>
          </div>
          <div className="catalogStats" aria-label="Статистика каталога">
            <strong>{products.length}</strong>
            <span>товаров</span>
            <strong>{minPrice}</strong>
            <span>минимальная цена</span>
          </div>
        </div>

        <div className="catalogToolbar" data-reveal>
          <label className="catalogSearch">
            <span>Поиск</span>
            <input
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                resetLimit();
              }}
              placeholder="RTX 3070, Ryzen, 80 000..."
            />
          </label>

          <label className="catalogSort">
            <span>Сортировка</span>
            <select
              value={sortBy}
              onChange={(event) => {
                setSortBy(event.target.value as SortOption);
                resetLimit();
              }}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
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

        <div className="catalogFilters" aria-label="Фильтр по классу" data-reveal>
          <span>Класс</span>
          {gpuFilters.map((filter) => (
            <button
              className={activeGpuFilter === filter ? 'isActive' : ''}
              key={filter}
              type="button"
              onClick={() => {
                setActiveGpuFilter(filter);
                resetLimit();
              }}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="catalogResultLine" data-reveal>
          Найдено: <strong>{filteredProducts.length}</strong>
        </div>

        <div className="catalogGrid">
          {visibleProducts.map((product) => {
            const cardTitle = getCardTitle(product.gpuTier);
            const processorBrand = getProcessorBrand(product.details.cpu || product.normalizedTitle);
            const fps = getFpsEstimate(product.priceValue, product.gpuTier);
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
                      href={`#order-${getProductKey(product)}`}
                      onClick={(event) => {
                        event.preventDefault();
                        openCheckout(product);
                      }}
                    >
                      Купить ПК <span>→</span>
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
                      <span>Средний FPS в играх</span>
                    </div>
                    <button type="button" aria-label="Подробнее о FPS">?</button>
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
          <aside className="productSpecDrawer" role="dialog" aria-modal="true" aria-labelledby="product-spec-title">
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
                  href={`#order-${getProductKey(selectedProduct)}`}
                  onClick={(event) => {
                    event.preventDefault();
                    openCheckout(selectedProduct);
                  }}
                >
                  Купить ПК <span>→</span>
                </a>
                <a className="productDetailsButton" href={contacts.telegram} target="_blank" rel="noreferrer">
                  Telegram <span>›</span>
                </a>
              </div>
            </div>
          </aside>
        </div>
      )}

      {checkoutProduct && (
        <div
          className={`checkoutOverlay ${isCheckoutClosing ? 'isClosing' : ''}`}
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeCheckout();
          }}
        >
          <aside className="checkoutModal" role="dialog" aria-modal="true" aria-labelledby="checkout-title">
            <button type="button" className="checkoutClose" aria-label="Закрыть оформление" onClick={closeCheckout}>
              ×
            </button>
            <h3 id="checkout-title">Оформление</h3>
            <p>Скопируйте заявку и отправьте нам в удобный мессенджер. Мы быстро уточним детали и наличие.</p>

            <div className="checkoutHint">
              <span>!</span>
              <b>1. Скопируйте текст ниже<br />2. Выберите канал для отправки</b>
            </div>

            <pre className="checkoutText">{buildOrderText(checkoutProduct)}</pre>

            <div className="checkoutActions">
              <button className="checkoutCopyButton" type="button" onClick={copyCheckoutText}>
                {copyState === 'copied' ? 'Скопировано' : 'Скопировать'} <span>⧉</span>
              </button>
              <a href={contacts.avito} target="_blank" rel="noreferrer" onClick={() => trackEvent('product_cta_click', { productId: checkoutProduct.sourceId, channel: 'avito', placement: 'checkout_modal' })}>
                Avito <span>→</span>
              </a>
              <a
                href={`${contacts.vk}?message=${buildContactMessage(buildOrderText(checkoutProduct))}`}
                target="_blank"
                rel="noreferrer"
                onClick={() => trackEvent('product_cta_click', { productId: checkoutProduct.sourceId, channel: 'vk', placement: 'checkout_modal' })}
              >
                VK <span>→</span>
              </a>
              <a href={contacts.telegram} target="_blank" rel="noreferrer" onClick={() => trackEvent('product_cta_click', { productId: checkoutProduct.sourceId, channel: 'telegram', placement: 'checkout_modal' })}>
                Telegram <span>→</span>
              </a>
            </div>
          </aside>
        </div>
      )}
    </section>
  );
}
