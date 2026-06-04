import { useEffect } from 'react';

export function useScrollReveal() {
  useEffect(() => {
    const items = document.querySelectorAll<HTMLElement>('[data-reveal]');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('isVisible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14 },
    );

    items.forEach((item, index) => {
      item.classList.add('reveal');
      item.style.transitionDelay = `${Math.min(index * 60, 240)}ms`;
      observer.observe(item);
    });

    return () => observer.disconnect();
  }, []);
}
