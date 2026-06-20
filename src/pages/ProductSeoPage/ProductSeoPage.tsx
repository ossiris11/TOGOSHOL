import { contacts } from '../../data/contacts';
import { getBusinessJsonLd, siteUrl } from '../../data/seo';
import { SeoHead } from '../../components/SeoHead/SeoHead';
import { useProducts } from '../../hooks/useProducts';
import { getProductBySlug, getProductSlug } from '../../lib/products';
import './ProductSeoPage.css';

type ProductSeoPageProps = {
  slug: string;
};

export function ProductSeoPage({ slug }: ProductSeoPageProps) {
  const { products, loading, source } = useProducts();
  const product = getProductBySlug(products, slug);

  if (!product) {
    const unavailable = source === 'unavailable';
    const stateTitle = loading ? 'Загрузка игрового ПК - TOGOSHOL' : unavailable ? 'Каталог временно недоступен - TOGOSHOL' : 'Сборка не найдена - TOGOSHOL';
    const stateDescription = loading ? 'Получаем актуальные данные об игровом компьютере.' : 'Эта сборка сейчас недоступна. Посмотрите актуальный каталог игровых ПК TOGOSHOL.';

    return (
      <>
        <SeoHead title={stateTitle} description={stateDescription} path={`/catalog/${slug}`} />
        <main className="productSeoPage">
          <section className="productSeoHero">
            <div className="container">
              <span className="badge">Каталог</span>
              <h1>{loading ? 'Загружаем сборку' : unavailable ? 'Каталог временно недоступен' : 'Сборка не найдена'}</h1>
              <p>{loading ? 'Получаем актуальные данные из админки.' : 'Возможно, компьютер уже продан или скрыт. Посмотри актуальный каталог или напиши нам.'}</p>
              <a className="button buttonPrimary" href="/#catalog">Вернуться в каталог</a>
            </div>
          </section>
        </main>
      </>
    );
  }

  const path = `/catalog/${getProductSlug(product)}`;
  const title = `Игровой ПК ${product.normalizedTitle} в Великом Новгороде - TOGOSHOL`;
  const description = `${product.price}: ${product.useCase}. ${product.cleanSpecs.slice(0, 4).join(', ')}. Самовывоз в Великом Новгороде, доставка обсуждается отдельно.`;
  const jsonLd = [
    getBusinessJsonLd(),
    {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: `Игровой ПК ${product.normalizedTitle}`,
      description,
      brand: { '@type': 'Brand', name: 'TOGOSHOL' },
      category: 'Игровой компьютер',
      offers: {
        '@type': 'Offer',
        url: `${siteUrl}${path}`,
        priceCurrency: 'RUB',
        price: product.priceValue,
        availability: product.badgeType === 'available' ? 'https://schema.org/InStock' : 'https://schema.org/PreOrder',
      },
    },
  ];

  return (
    <main className="productSeoPage">
      <SeoHead title={title} description={description} path={path} jsonLd={jsonLd} />
      <section className="productSeoHero">
        <div className="container productSeoGrid">
          <div>
            <span className="badge">{product.badge}</span>
            <h1>Игровой ПК {product.normalizedTitle}</h1>
            <p>{description}</p>
            <div className="productSeoActions">
              <a className="button buttonPrimary" href={contacts.vk} target="_blank" rel="noreferrer">Уточнить наличие</a>
              <a className="button buttonSecondary" href="/#catalog">Все сборки</a>
            </div>
          </div>
          <aside className="productSeoPrice">
            <span>Цена</span>
            <strong>{product.price}</strong>
            <p>{product.useCase}</p>
          </aside>
        </div>
      </section>

      <section className="section productSeoSpecs" aria-labelledby="product-specs-title">
        <div className="container">
          <div className="sectionHeader">
            <h2 id="product-specs-title" className="sectionTitle">Характеристики сборки</h2>
          </div>
          <dl className="productSeoSpecGrid">
            {product.cleanSpecs.map((spec) => (
              <div key={spec}>
                <dt>Комплектующее</dt>
                <dd>{spec}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </main>
  );
}
