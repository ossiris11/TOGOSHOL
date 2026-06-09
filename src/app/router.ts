import { useEffect, useMemo, useState } from 'react';

export type AppRoute = 'home' | 'gaming-pc-novgorod' | 'custom-pc-novgorod' | 'upgrade-pc-novgorod' | 'contacts' | 'category' | 'product' | 'admin' | 'not-found';

export function getAppRoute(pathname: string): AppRoute {
  if (pathname === '/') return 'home';
  if (pathname === '/igrovye-pk-velikiy-novgorod') return 'gaming-pc-novgorod';
  if (pathname === '/sborka-pk-na-zakaz-velikiy-novgorod') return 'custom-pc-novgorod';
  if (pathname === '/upgrade-pc-velikiy-novgorod') return 'upgrade-pc-novgorod';
  if (pathname === '/contacts') return 'contacts';
  if (/^\/catalog\/(full-hd|2k|4k|rtx|ryzen|intel)$/.test(pathname)) return 'category';
  if (pathname.startsWith('/catalog/')) return 'product';
  if (pathname.startsWith('/admin')) return 'admin';
  return 'not-found';
}

export function useAppRoute() {
  const [pathname, setPathname] = useState(() => window.location.pathname);

  useEffect(() => {
    const update = () => setPathname(window.location.pathname);
    window.addEventListener('popstate', update);
    window.addEventListener('pushstate', update);
    window.addEventListener('replacestate', update);
    return () => {
      window.removeEventListener('popstate', update);
      window.removeEventListener('pushstate', update);
      window.removeEventListener('replacestate', update);
    };
  }, []);

  return useMemo(() => ({ pathname, route: getAppRoute(pathname) }), [pathname]);
}
