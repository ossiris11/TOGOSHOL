import { useState } from 'react';
import { useHeroParallax } from '../../hooks/useHeroParallax';
import { vkProducts } from '../../data/vkProducts';
import { getProductViews } from '../../lib/products';
import heroPc from '../../assets/hero-pc.png';
import './Hero.css';

const metrics = ['26 сборок из VK', 'Стресс-тест перед выдачей', 'Локальная поддержка'];

export function Hero() {
  const visualRef = useHeroParallax<HTMLDivElement>();
  const products = getProductViews(vkProducts).filter((product) => product.priceValue >= 60000).slice(0, 6);
  const [activeBuild, setActiveBuild] = useState(products[1]?.vkUrl || products[0]?.vkUrl || '');
  const selectedProduct = products.find((product) => product.vkUrl === activeBuild) || products[0];

  return (
    <section id="top" className="hero">
      <div className="heroBg" aria-hidden="true" />
      <div className="heroInner container">
        <div className="heroContent">
          <span className="badge heroBadge">Готовые и кастомные игровые ПК</span>
          <h1 className="heroTitle">Игровые ПК в Великом Новгороде</h1>
          <p className="heroSubtitle">
            Готовые сборки от 47 900 ₽ и кастомные ПК под твой бюджет. Подберём комплектующие, протестируем систему и
            подготовим к запуску.
          </p>
          {selectedProduct && (
            <div className="heroSelectedBuild" aria-live="polite">
              <span>Выбрано из наличия</span>
              <strong>{selectedProduct.normalizedTitle}</strong>
              <b>{selectedProduct.price}</b>
            </div>
          )}
          <div className="heroActions">
            <a className="button buttonPrimary" href="https://vk.me/tog_pc" target="_blank" rel="noreferrer">
              Подобрать ПК
            </a>
            <a className="button buttonSecondary" href={selectedProduct?.vkUrl || '#catalog'} target={selectedProduct?.vkUrl ? '_blank' : undefined} rel={selectedProduct?.vkUrl ? 'noreferrer' : undefined}>
              Открыть выбранную
            </a>
          </div>
          <div className="heroMetrics">
            {metrics.map((metric) => (
              <div key={metric}>{metric}</div>
            ))}
          </div>
        </div>

        <div className="heroVisual" ref={visualRef}>
          <div className="heroVisualInner">
            <img src={heroPc} alt="Игровой ПК TOGOSHOL с RGB-подсветкой" />
            <span className="heroPcGlow" aria-hidden="true" />
          </div>
        </div>
      </div>

      <div id="builds" className="heroBuilds container" aria-label="Готовые сборки">
        <div className="heroBuildsHeader">
          <span>Рекомендуемые сборки</span>
          <a href="#catalog">Все 26 товаров</a>
        </div>
        <div className="heroBuildsTrack">
          {products.map((build) => {
            const isActive = activeBuild === build.vkUrl;

            return (
              <article
                className={`heroBuildCard ${isActive ? 'isActive' : ''}`}
                key={build.vkUrl || build.title}
                role="button"
                tabIndex={0}
                onClick={(event) => {
                  if ((event.target as HTMLElement).closest('a')) return;
                  setActiveBuild(build.vkUrl || build.title);
                  event.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    setActiveBuild(build.vkUrl || build.title);
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
                <a className="heroBuildCta" href={build.vkUrl} target="_blank" rel="noreferrer">
                  Открыть в VK
                </a>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
