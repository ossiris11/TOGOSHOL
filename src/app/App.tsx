import { useEffect } from 'react';
import { AdminApp } from '../admin/AdminApp';
import { Header } from '../components/Header/Header';
import { Hero } from '../components/Hero/Hero';
import { ProductCatalog } from '../components/ProductCatalog/ProductCatalog';
import { CustomBuild } from '../components/CustomBuild/CustomBuild';
import { WhyTogoshol } from '../components/WhyTogoshol/WhyTogoshol';
import { TrustConditions } from '../components/TrustConditions/TrustConditions';
import { OrderProcess } from '../components/OrderProcess/OrderProcess';
import { SocialProof } from '../components/SocialProof/SocialProof';
import { Faq } from '../components/Faq/Faq';
import { FinalCta } from '../components/FinalCta/FinalCta';
import { Footer } from '../components/Footer/Footer';
import { NotFound } from '../components/NotFound/NotFound';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { trackEvent } from '../lib/api';

export function App() {
  useScrollReveal();
  const pathname = window.location.pathname;

  useEffect(() => {
    if (!pathname.startsWith('/admin')) trackEvent('page_view', { pathname });
  }, [pathname]);

  if (pathname.startsWith('/admin')) return <AdminApp />;
  if (pathname !== '/') return <NotFound />;

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
        <SocialProof />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
