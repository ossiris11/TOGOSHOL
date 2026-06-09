import { contacts } from '../../data/contacts';
import { categorySeoPages, getLocalPageJsonLd, type CategorySlug } from '../../data/seo';
import { vkProducts } from '../../data/vkProducts';
import { getProductSlug, getProductsByCategory } from '../../lib/products';
import { SeoHead } from '../../components/SeoHead/SeoHead';
import './CatalogSeoPage.css';

type CatalogSeoPageProps = {
  slug: CategorySlug;
};

export function CatalogSeoPage({ slug }: CatalogSeoPageProps) {
  const page = categorySeoPages[slug];
  const products = getProductsByCategory(vkProducts, slug).slice(0, 12);

  return (
    <main className="catalogSeoPage">
      <SeoHead {...page} jsonLd={getLocalPageJsonLd(page, page.heading)} />
      <section className="catalogSeoHero">
        <div className="container">
          <span className="badge">Каталог</span>
          <h1>{page.heading}</h1>
          <p>{page.intro} Все варианты можно адаптировать под бюджет, корпус, шум, внешний вид и наличие комплектующих.</p>
          <div className="catalogSeoActions">
            <a className="button buttonPrimary" href={contacts.vk} target="_blank" rel="noreferrer">
              Уточнить наличие
            </a>
            <a className="button buttonSecondary" href="/#custom">
              Собрать под заказ
            </a>
          </div>
        </div>
      </section>

      <section className="section catalogSeoList" aria-labelledby="catalog-seo-list-title">
        <div className="container">
          <div className="sectionHeader">
            <h2 id="catalog-seo-list-title" className="sectionTitle">Подходящие сборки</h2>
            <p className="sectionText">Цены и наличие лучше уточнить перед заказом: часть компьютеров может быть продана или собрана в другой конфигурации.</p>
          </div>
          <div className="catalogSeoGrid">
            {products.map((product) => (
              <article className="catalogSeoCard" key={getProductSlug(product)}>
                <span>{product.badge}</span>
                <h3>{product.normalizedTitle}</h3>
                <p>{product.useCase} · {product.cleanSpecs.slice(0, 3).join(' · ')}</p>
                <strong>{product.price}</strong>
                <a href={`/catalog/${getProductSlug(product)}`}>Страница сборки</a>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
