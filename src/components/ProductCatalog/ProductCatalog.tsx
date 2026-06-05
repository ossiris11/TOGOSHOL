import { useMemo, useState } from 'react';
import { buildContactMessage, contacts } from '../../data/contacts';
import { useProducts } from '../../hooks/useProducts';
import { trackEvent } from '../../lib/api';
import { getBudgetLabel, getProductKey, getProductSearchText, getProductViews } from '../../lib/products';
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

type Filter = (typeof filters)[number];
type GpuFilter = (typeof gpuFilters)[number];
type SortOption = (typeof sortOptions)[number]['value'];

function buildMessage(title: string, price: string) {
  return buildContactMessage(`Здравствуйте! Интересует сборка ${title} за ${price}. Хочу уточнить наличие и детали.`);
}

export function ProductCatalog() {
  const [activeFilter, setActiveFilter] = useState<Filter>('Все');
  const [activeGpuFilter, setActiveGpuFilter] = useState<GpuFilter>('Все');
  const [sortBy, setSortBy] = useState<SortOption>('recommended');
  const [query, setQuery] = useState('');
  const [showAll, setShowAll] = useState(false);
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
          {visibleProducts.map((product) => (
            <article className="productCard" key={getProductKey(product)} data-reveal>
              <div className="productImage" aria-label={product.normalizedTitle}>
                <img
                  src={product.image || heroPc}
                  alt={product.normalizedTitle}
                  loading="lazy"
                  decoding="async"
                  onError={(event) => {
                    event.currentTarget.src = heroPc;
                  }}
                />
              </div>

              <div className="productInfo">
                <span className={`badge ${product.badgeType === 'available' ? 'badgeAvailable' : ''}`}>{product.badge}</span>
                <div className="productChips" aria-label="Класс сборки">
                  <span>{product.gpuTier}</span>
                  <span>{product.useCase}</span>
                </div>
                <h3>{product.normalizedTitle}</h3>
                <strong>{product.price}</strong>

                <div className="productSpecChips">
                  {[
                    ['CPU', product.details.cpu],
                    ['GPU', product.details.gpu],
                    ['RAM', product.details.ram],
                    ['SSD', product.details.storage],
                  ]
                    .filter(([, value]) => value)
                    .map(([label, value]) => (
                      <span key={label}>
                        <b>{label}</b>
                        {value}
                      </span>
                    ))}
                </div>

                <div className="productActions">
                  <a
                    className="button buttonPrimary"
                    href={`${contacts.vk}?message=${buildMessage(product.normalizedTitle, product.price)}`}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => trackEvent('product_cta_click', { productId: product.sourceId, title: product.normalizedTitle, channel: 'vk', placement: 'catalog' })}
                  >
                    Написать в VK
                  </a>
                  <a className="button buttonSecondary" href={contacts.telegram} target="_blank" rel="noreferrer" onClick={() => trackEvent('contact_click_telegram', { productId: product.sourceId, placement: 'catalog' })}>
                    Telegram
                  </a>
                </div>
              </div>
            </article>
          ))}
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
    </section>
  );
}
