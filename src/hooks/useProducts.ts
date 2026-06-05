import { useEffect, useMemo, useState } from 'react';
import { vkProducts } from '../data/vkProducts';
import { apiProductToBuild, fetchPageBlocks, fetchProducts, type StorefrontBlocks } from '../lib/api';
import { getProductViews } from '../lib/products';
import type { Build } from '../data/builds';

type ProductState = {
  products: Build[];
  blocks: StorefrontBlocks | null;
  heroProducts: Build[];
  featuredProducts: Build[];
  loading: boolean;
};

export function useProducts(): ProductState {
  const [state, setState] = useState<ProductState>({
    products: vkProducts,
    blocks: null,
    heroProducts: [],
    featuredProducts: [],
    loading: true,
  });

  useEffect(() => {
    let alive = true;

    Promise.allSettled([fetchProducts(), fetchPageBlocks()]).then(([productsResult, blocksResult]) => {
      if (!alive) return;

      const products = productsResult.status === 'fulfilled' && productsResult.value.length > 0 ? productsResult.value : vkProducts;
      const blocksPayload = blocksResult.status === 'fulfilled' ? blocksResult.value : null;

      setState({
        products,
        blocks: blocksPayload?.blocks || null,
        heroProducts: blocksPayload?.products.hero.map(apiProductToBuild) || [],
        featuredProducts: blocksPayload?.products.featured.map(apiProductToBuild) || [],
        loading: false,
      });
    });

    return () => {
      alive = false;
    };
  }, []);

  return useMemo(() => state, [state]);
}

export function useProductViews(products: Build[]) {
  return useMemo(() => getProductViews(products), [products]);
}
