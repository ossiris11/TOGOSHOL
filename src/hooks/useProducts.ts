import { createContext, createElement, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { apiProductToBuild, fetchPageBlocks, fetchProducts, type StorefrontBlocks } from '../lib/api';
import { productDataChangedEvent, productDataStorageKey } from '../lib/productSync';
import { getProductViews } from '../lib/products';
import type { Build } from '../data/builds';

type ProductState = {
  products: Build[];
  blocks: StorefrontBlocks | null;
  heroProducts: Build[];
  featuredProducts: Build[];
  finalCtaProducts: Build[];
  loading: boolean;
  error: string | null;
  source: 'api' | 'unavailable';
};

const ProductContext = createContext<ProductState | null>(null);

function useProductState(): ProductState {
  const [state, setState] = useState<ProductState>({
    products: [],
    blocks: null,
    heroProducts: [],
    featuredProducts: [],
    finalCtaProducts: [],
    loading: true,
    error: null,
    source: 'unavailable',
  });

  useEffect(() => {
    let alive = true;
    let loadVersion = 0;

    const load = async () => {
      const version = ++loadVersion;
      const [productsResult, blocksResult] = await Promise.allSettled([fetchProducts(), fetchPageBlocks()]);
      if (!alive || version !== loadVersion) return;

      const blocksPayload = blocksResult.status === 'fulfilled' ? blocksResult.value : null;
      const blocks = blocksPayload?.blocks || null;
      const apiProducts = productsResult.status === 'fulfilled' ? productsResult.value : [];
      const featuredOrder = new Map((blocks?.featuredProductIds || []).map((id, index) => [id, index]));
      const products = apiProducts.map((product) => {
        if (!blocks) return product;
        const featuredSlot = product.sourceId ? featuredOrder.get(product.sourceId) : undefined;
        return { ...product, isFeatured: featuredSlot !== undefined, featuredSlot: featuredSlot ?? null };
      });
      const apiAvailable = productsResult.status === 'fulfilled';

      setState({
        products,
        blocks,
        heroProducts: blocksPayload?.products.hero.map(apiProductToBuild) || [],
        featuredProducts: blocksPayload?.products.featured.map(apiProductToBuild) || [],
        finalCtaProducts: blocksPayload?.products.finalCta.map(apiProductToBuild) || [],
        loading: false,
        error: apiAvailable ? (blocks ? null : 'Настройки витрины временно недоступны.') : 'Каталог временно недоступен: нет связи с сервером.',
        source: apiAvailable ? 'api' : 'unavailable',
      });
    };

    const refresh = () => void load();
    const onStorage = (event: StorageEvent) => {
      if (event.key === productDataStorageKey) refresh();
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') refresh();
    };

    void load();
    window.addEventListener(productDataChangedEvent, refresh);
    window.addEventListener('storage', onStorage);
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      alive = false;
      window.removeEventListener(productDataChangedEvent, refresh);
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  return useMemo(() => state, [state]);
}

export function ProductsProvider({ children }: { children: ReactNode }) {
  const state = useProductState();
  return createElement(ProductContext.Provider, { value: state }, children);
}

export function useProducts(): ProductState {
  const state = useContext(ProductContext);
  if (!state) throw new Error('useProducts must be used inside ProductsProvider');
  return state;
}

export function useProductViews(products: Build[]) {
  return useMemo(() => getProductViews(products), [products]);
}
