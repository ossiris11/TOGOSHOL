import { contacts } from '../../data/contacts';
import { trackEvent } from '../../lib/api';
import { useProducts } from '../../hooks/useProducts';
import { getProductKey, getProductViews } from '../../lib/products';
import heroPc from '../../assets/hero-pc-2026-cutout.webp';
import './SocialProof.css';

export function SocialProof() {
  const { products } = useProducts();
  const works = getProductViews(products)
    .filter((product) => product.image)
    .slice(0, 4);

  if (works.length === 0) return null;

  return (
    <section className="section socialProof" aria-labelledby="works-title">
      <div className="container">
        <div className="sectionHeader" data-reveal>
          <span className="badge">Готовые работы</span>
          <h2 id="works-title" className="sectionTitle">Фото реальных сборок</h2>
          <p className="sectionText">
            Показываем живые товары из витрины. Отзывы вынесены в отдельный блок выше, чтобы не смешивать фото сборок и скрины обратной связи.
          </p>
        </div>

        <div className="worksGrid">
          {works.map((product) => (
            <article className="workCard" key={getProductKey(product)} data-reveal>
              <img
                src={product.image || heroPc}
                alt={product.normalizedTitle}
                loading="lazy"
                decoding="async"
                onError={(event) => {
                  event.currentTarget.src = heroPc;
                }}
              />
              <div>
                <span>{product.gpuTier}</span>
                <h3>{product.normalizedTitle}</h3>
                <p>{product.price}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="proofFooter" data-reveal>
          <p>Нужны отзывы, наличие или больше фото конкретной сборки? Лучше уточнить напрямую: так быстрее и честнее.</p>
          <a className="button buttonSecondary" href={contacts.vk} target="_blank" rel="noreferrer" onClick={() => trackEvent('contact_click_vk', { placement: 'social_proof' })}>
            Написать в VK
          </a>
        </div>
      </div>
    </section>
  );
}
