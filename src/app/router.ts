import { useEffect, useMemo, useState } from 'react';

export type AppRoute = 'home' | 'admin' | 'not-found';

export function getAppRoute(pathname: string): AppRoute {
  if (pathname === '/') return 'home';
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
