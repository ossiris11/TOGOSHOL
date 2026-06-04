import { useEffect, useRef } from 'react';

export function useHeroParallax<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.matchMedia('(max-width: 768px)').matches;

    if (reduceMotion || isMobile) return;

    const onMove = (event: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;

      element.style.setProperty('--parallax-x', `${x * 16}px`);
      element.style.setProperty('--parallax-y', `${y * 16}px`);
    };

    const onLeave = () => {
      element.style.setProperty('--parallax-x', '0px');
      element.style.setProperty('--parallax-y', '0px');
    };

    element.addEventListener('mousemove', onMove);
    element.addEventListener('mouseleave', onLeave);

    return () => {
      element.removeEventListener('mousemove', onMove);
      element.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return ref;
}
