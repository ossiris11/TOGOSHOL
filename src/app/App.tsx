import { useEffect } from 'react';
import { AdminApp } from '../admin/AdminApp';
import { Header } from '../components/Header/Header';
import { Hero } from '../components/Hero/Hero';
import { ProductCatalog } from '../components/ProductCatalog/ProductCatalog';
import { CustomBuild } from '../components/CustomBuild/CustomBuild';
import { WhyTogoshol } from '../components/WhyTogoshol/WhyTogoshol';
import { TrustConditions } from '../components/TrustConditions/TrustConditions';
import { OrderProcess } from '../components/OrderProcess/OrderProcess';
import { Faq } from '../components/Faq/Faq';
import { FinalCta } from '../components/FinalCta/FinalCta';
import { Footer } from '../components/Footer/Footer';
import { NotFound } from '../components/NotFound/NotFound';
import { SeoHead } from '../components/SeoHead/SeoHead';
import { ContactsPage } from '../pages/ContactsPage/ContactsPage';
import { CatalogSeoPage } from '../pages/CatalogSeoPage/CatalogSeoPage';
import { ProductSeoPage } from '../pages/ProductSeoPage/ProductSeoPage';
import { LocalSeoPage } from '../pages/LocalSeoPage/LocalSeoPage';
import { categorySeoPages, getHomeJsonLd, getLocalPageJsonLd, seoPages, type CategorySlug } from '../data/seo';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { trackEvent } from '../lib/api';
import { useAppRoute } from './router';

export function App() {
  useScrollReveal();
  const { pathname, route } = useAppRoute();

  useEffect(() => {
    if (!pathname.startsWith('/admin')) trackEvent('page_view', { pathname });
  }, [pathname]);

  if (route === 'admin') return <AdminApp />;
  if (route === 'not-found') return <NotFound />;

  if (route === 'gaming-pc-novgorod') {
    return (
      <>
        <SeoHead {...seoPages.gamingPcNovgorod} jsonLd={getLocalPageJsonLd(seoPages.gamingPcNovgorod, 'Продажа игровых ПК в Великом Новгороде')} />
        <Header />
        <LocalSeoPage variant="gaming" />
        <Footer />
      </>
    );
  }

  if (route === 'custom-pc-novgorod') {
    return (
      <>
        <SeoHead {...seoPages.customPcNovgorod} jsonLd={getLocalPageJsonLd(seoPages.customPcNovgorod, 'Сборка ПК на заказ в Великом Новгороде')} />
        <Header />
        <LocalSeoPage variant="custom" />
        <Footer />
      </>
    );
  }

  if (route === 'upgrade-pc-novgorod') {
    return (
      <>
        <SeoHead {...seoPages.upgradePcNovgorod} jsonLd={getLocalPageJsonLd(seoPages.upgradePcNovgorod, 'Апгрейд ПК в Великом Новгороде')} />
        <Header />
        <LocalSeoPage variant="upgrade" />
        <Footer />
      </>
    );
  }

  if (route === 'contacts') {
    return (
      <>
        <SeoHead {...seoPages.contacts} jsonLd={getLocalPageJsonLd(seoPages.contacts, 'Консультация по игровым ПК в Великом Новгороде')} />
        <Header />
        <ContactsPage />
        <Footer />
      </>
    );
  }

  if (route === 'category') {
    const slug = pathname.split('/').at(-1) as CategorySlug;
    if (!categorySeoPages[slug]) return <NotFound />;

    return (
      <>
        <Header />
        <CatalogSeoPage slug={slug} />
        <Footer />
      </>
    );
  }

  if (route === 'product') {
    const slug = pathname.split('/').at(-1) || '';

    return (
      <>
        <Header />
        <ProductSeoPage slug={slug} />
        <Footer />
      </>
    );
  }

  return (
    <>
      <SeoHead {...seoPages.home} jsonLd={getHomeJsonLd()} />
      <Header />
      <main>
        <Hero />
        <ProductCatalog />
        <CustomBuild />
        <WhyTogoshol />
        <TrustConditions />
        <OrderProcess />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
