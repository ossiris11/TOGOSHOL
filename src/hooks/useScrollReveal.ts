import { useEffect } from 'react';

export function useScrollReveal() {
  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion) {
      document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((item) => item.classList.add('isVisible'));
      return undefined;
    }

    const observedItems = new WeakSet<HTMLElement>();
    let itemIndex = 0;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('isVisible');
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    );

    const observeItem = (item: HTMLElement) => {
      if (observedItems.has(item)) return;
      observedItems.add(item);
      item.classList.add('reveal');
      item.style.transitionDelay = `${Math.min(itemIndex * 60, 240)}ms`;
      itemIndex += 1;
      observer.observe(item);
    };

    document.querySelectorAll<HTMLElement>('[data-reveal]').forEach(observeItem);

    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) return;
          if (node.matches('[data-reveal]')) observeItem(node);
          node.querySelectorAll<HTMLElement>('[data-reveal]').forEach(observeItem);
        });
      });
    });
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      mutationObserver.disconnect();
      observer.disconnect();
    };
  }, []);
}
