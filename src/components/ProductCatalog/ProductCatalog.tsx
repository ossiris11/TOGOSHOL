import { useMemo, useState } from 'react';
import { vkProducts } from '../../data/vkProducts';
import { getBudgetLabel, getProductViews } from '../../lib/products';
import heroPc from '../../assets/hero-pc.png';
import './ProductCatalog.css';

const filters = ['Все', 'до 60k', '60–90k', '90–150k', '150k+'] as const;
type Filter = (typeof filters)[number];

function buildMessage(title: string, price: string) {
  return encodeURIComponent(`Здравствуйте! Интересует сборка ${title} за ${price}. Хочу уточнить наличие и детали.`);
}

export function ProductCatalog() {
  const [activeFilter, setActiveFilter] = useState<Filter>('Все');
  const products = useMemo(() => getProductViews(vkProducts), []);
  const filteredProducts = activeFilter === 'Все' ? products : products.filter((product) => getBudgetLabel(product.priceValue) === activeFilter);
  const minPrice = products[0]?.price || 'по запросу';

  return (
    <section id="catalog" className="section productCatalog">
      <div className="container">
        <div className="catalogHeader" data-reveal>
          <div>
            <span className="badge">Каталог из VK</span>
            <h2 className="sectionTitle">Все сборки TOGOSHOL</h2>
            <p className="sectionText">
              Реальные карточки из VK: цены, фото и конфигурации. Выбери бюджет или напиши по конкретной сборке.
            </p>
          </div>
          <div className="catalogStats" aria-label="Статистика каталога">
            <strong>{products.length}</strong>
            <span>товаров</span>
            <strong>{minPrice}</strong>
            <span>минимальная цена</span>
          </div>
        </div>

        <div className="catalogFilters" aria-label="Фильтр по бюджету" data-reveal>
          {filters.map((filter) => (
            <button className={activeFilter === filter ? 'isActive' : ''} key={filter} type="button" onClick={() => setActiveFilter(filter)}>
              {filter}
            </button>
          ))}
        </div>

        <div className="catalogGrid">
          {filteredProducts.map((product) => (
            <article className="productCard" key={product.vkUrl || product.title} data-reveal>
              <a className="productImage" href={product.vkUrl} target="_blank" rel="noreferrer" aria-label={`Открыть ${product.normalizedTitle} в VK`}>
                <img
                  src={product.image || heroPc}
                  alt={product.normalizedTitle}
                  loading="lazy"
                  decoding="async"
                  onError={(event) => {
                    event.currentTarget.src = heroPc;
                  }}
                />
              </a>

              <div className="productInfo">
                <span className={`badge ${product.badgeType === 'available' ? 'badgeAvailable' : ''}`}>{product.badge}</span>
                <h3>{product.normalizedTitle}</h3>
                <strong>{product.price}</strong>

                <dl className="productSpecs">
                  {product.cleanSpecs.slice(0, 4).map((spec) => (
                    <div key={spec}>
                      <dt>{spec.includes(':') ? spec.split(':')[0] : 'Характеристика'}</dt>
                      <dd>{spec.includes(':') ? spec.split(':').slice(1).join(':').trim() : spec}</dd>
                    </div>
                  ))}
                </dl>

                <div className="productActions">
                  <a className="button buttonPrimary" href={`https://vk.me/tog_pc?message=${buildMessage(product.normalizedTitle, product.price)}`} target="_blank" rel="noreferrer">
                    Написать
                  </a>
                  <a className="button buttonSecondary" href={product.vkUrl} target="_blank" rel="noreferrer">
                    VK
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
