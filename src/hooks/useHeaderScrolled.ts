import { useEffect, useState } from 'react';

export function useHeaderScrolled() {
  const [isScrolled, setIsScrolled] = useState(() => typeof window !== 'undefined' && window.scrollY > 12);

  useEffect(() => {
    let scrolled = window.scrollY > 12;
    const onScroll = () => {
      const nextScrolled = window.scrollY > 12;
      if (nextScrolled === scrolled) return;
      scrolled = nextScrolled;
      setIsScrolled(nextScrolled);
    };

    const initialSyncFrame = window.requestAnimationFrame(() => setIsScrolled(scrolled));
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.cancelAnimationFrame(initialSyncFrame);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return isScrolled;
}
