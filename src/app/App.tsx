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

  return (
    <>
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
