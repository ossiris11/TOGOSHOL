import { useEffect, useMemo, useRef, useState } from 'react';
import { useHeroParallax } from '../../hooks/useHeroParallax';
import { buildContactMessage, contacts } from '../../data/contacts';
import { useProducts } from '../../hooks/useProducts';
import { trackEvent } from '../../lib/api';
import { getProductKey, getProductViews } from '../../lib/products';
import heroPc from '../../assets/hero-pc.png';
import './Hero.css';

export function Hero() {
  const visualRef = useHeroParallax<HTMLDivElement>();
  const trackRef = useRef<HTMLDivElement>(null);
  const { products: allProducts, featuredProducts } = useProducts();
  const products = useMemo(() => {
    const source = featuredProducts.length > 0 ? featuredProducts : allProducts;
    return getProductViews(source).slice(0, 6);
  }, [allProducts, featuredProducts]);
  const [activeBuild, setActiveBuild] = useState('');
  const selectedProduct = products.find((product) => getProductKey(product) === activeBuild) || products[0];

  useEffect(() => {
    if (!activeBuild && products[0]) setActiveBuild(products[1] ? getProductKey(products[1]) : getProductKey(products[0]));
  }, [activeBuild, products]);

  return (
    <section id="top" className="hero">
      <div className="heroBg" aria-hidden="true" />
      <div className="heroInner container">
        <div className="heroContent">
          <span className="badge heroBadge">Готовые и кастомные игровые ПК</span>
          <h1 className="heroTitle">
            <span>Игровые ПК</span>
            <span>в <b>Великом</b></span>
            <span><b>Новгороде</b></span>
          </h1>
          <p className="heroSubtitle">
            Собираем мощные компьютеры под игры, стриминг и работу. Подберём комплектующие, протестируем систему и
            поможем с подключением. Локальная поддержка под ключ.
          </p>
          <div className="heroActions">
            <a className="button buttonPrimary" href="#custom">
              Подобрать ПК
            </a>
              <a
                className="button buttonSecondary"
                href="#catalog"
                onClick={() => trackEvent('page_view', { section: 'catalog_from_hero' })}
              >
              Смотреть сборки
            </a>
          </div>
          <div className="heroStats" aria-label="Преимущества TOGOSHOL">
            <div>
              <strong>5-20</strong>
              <span>ПК в наличии и под заказ</span>
            </div>
            <div>
              <strong>100%</strong>
              <span>стресс-тест перед выдачей</span>
            </div>
            <div>
              <strong>Локально</strong>
              <span>новгородская поддержка</span>
            </div>
          </div>
        </div>

        <div className="heroVisual" ref={visualRef}>
          <div className="heroLighting" aria-label="Цвет подсветки">
            <span>Подсветка:</span>
            <i className="isCyan" />
            <i className="isViolet" />
            <i className="isGreen" />
            <i className="isRed" />
          </div>
          <div className="heroVisualInner" aria-label="Игровой ПК TOGOSHOL с RGB-подсветкой">
            <div className="heroPcCase" aria-hidden="true">
              <span className="heroCaseLine heroCaseLineTopA" />
              <span className="heroCaseLine heroCaseLineTopB" />
              <span className="heroCaseLine heroCaseLineTopC" />
              <span className="heroScrew heroScrewTl" />
              <span className="heroScrew heroScrewTr" />
              <span className="heroScrew heroScrewBl" />
              <span className="heroScrew heroScrewBr" />
              <span className="heroFan"><i /></span>
              <span className="heroRamGlow" />
              <span className="heroLogoCore">TOGO</span>
              <span className="heroCableArc" />
              <span className="heroGpuPlate">
                <small>GeForce RTX</small>
                <i />
              </span>
              <span className="heroCaseDivider" />
              <span className="heroBottomRail" />
            </div>
            {selectedProduct && (
              <div className="heroSelectedBuild" aria-live="polite">
                <span>Выбрано из наличия</span>
                <strong>{selectedProduct.normalizedTitle}</strong>
                <b>{selectedProduct.price}</b>
              </div>
            )}
          </div>
        </div>
      </div>

      <div id="builds" className="heroBuilds container" aria-label="Готовые сборки">
        <div className="heroBuildsHeader">
          <span>Рекомендуемые сборки</span>
          <div className="heroBuildsControls">
            <button type="button" onClick={() => trackRef.current?.scrollBy({ left: -360, behavior: 'smooth' })} aria-label="Назад">‹</button>
            <button type="button" onClick={() => trackRef.current?.scrollBy({ left: 360, behavior: 'smooth' })} aria-label="Вперед">›</button>
            <a href="#catalog">Все {allProducts.length} товаров</a>
          </div>
        </div>
        <div className="heroBuildsTrack" ref={trackRef}>
          {products.map((build) => {
            const buildKey = getProductKey(build);
            const isActive = activeBuild === buildKey;

            return (
              <article
                className={`heroBuildCard ${isActive ? 'isActive' : ''}`}
                key={buildKey}
                role="button"
                tabIndex={0}
                onClick={(event) => {
                  if ((event.target as HTMLElement).closest('a')) return;
                  setActiveBuild(buildKey);
                  event.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    setActiveBuild(buildKey);
                  }
                }}
                aria-pressed={isActive}
              >
                <span className={`badge ${build.badgeType === 'available' ? 'badgeAvailable' : ''}`}>{build.badge}</span>
                <span className="heroBuildMedia" aria-hidden="true">
                  <img src={build.image || heroPc} alt="" />
                </span>
                <span className="heroBuildCopy">
                  <strong>{build.normalizedTitle}</strong>
                  <small>{build.cleanSpecs.slice(0, 2).join(' / ')}</small>
                  <span className="heroBuildPrice">{build.price}</span>
                </span>
                <span className="heroBuildSpecs">
                  {build.cleanSpecs.map((spec) => (
                    <i key={spec}>{spec}</i>
                  ))}
                </span>
                <a
                  className="heroBuildCta"
                  href={`${contacts.vk}?message=${buildContactMessage(`Здравствуйте! Интересует сборка ${build.normalizedTitle} за ${build.price}.`)}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => trackEvent('product_cta_click', { productId: build.sourceId, title: build.normalizedTitle, channel: 'vk', placement: 'hero' })}
                >
                  Написать
                </a>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
