import { useRef } from 'react';
import { useHeroParallax } from '../../hooks/useHeroParallax';
import { trackEvent } from '../../lib/api';
import heroPc from '../../assets/hero-pc.png';
import './Hero.css';

export function Hero() {
  const visualRef = useHeroParallax<HTMLDivElement>();

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
          <div className="heroVisualInner">
            <div className="heroPcPhotoFrame">
              <img src={heroPc} alt="Мощный игровой ПК TOGOSHOL с RGB-подсветкой" />
              <span className="heroPcPhotoGlow" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
