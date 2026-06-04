# TOGOSHOL — Animations

## Главный принцип

Анимации должны выглядеть дорого и спокойно.

Нельзя делать:

- резкие движения;
- хаотичные переливы;
- слишком быстрые RGB-эффекты;
- постоянное движение всего интерфейса;
- перегруз hover-эффектами.

Нужно делать:

- плавный reveal;
- лёгкий parallax;
- hover lift;
- мягкий glow;
- медленную RGB pulse;
- sticky header blur;
- аккуратное mobile menu.

---

# Reduced motion

Обязательно добавить:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation: none !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

# 1. Reveal on scroll

## Эффект

```text
opacity: 0 → 1
translateY: 36px → 0
duration: 600–800ms
easing: cubic-bezier(0.16, 1, 0.3, 1)
stagger: 80–120ms
```

## CSS variant

```css
.reveal {
  opacity: 0;
  transform: translateY(36px);
  transition:
    opacity 700ms var(--ease-premium),
    transform 700ms var(--ease-premium);
}

.reveal.isVisible {
  opacity: 1;
  transform: translateY(0);
}
```

## IntersectionObserver hook

```ts
import { useEffect } from 'react';

export function useScrollReveal() {
  useEffect(() => {
    const items = document.querySelectorAll<HTMLElement>('[data-reveal]');

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('isVisible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14 }
    );

    items.forEach((item, index) => {
      item.classList.add('reveal');
      item.style.transitionDelay = `${Math.min(index * 60, 240)}ms`;
      observer.observe(item);
    });

    return () => observer.disconnect();
  }, []);
}
```

---

# 2. Header blur on scroll

## Эффект

При scrollY > 12 header получает класс `isScrolled`.

```css
.header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(5, 5, 5, 0.42);
  border-bottom: 1px solid transparent;
  transition: background 220ms ease, border-color 220ms ease, backdrop-filter 220ms ease;
}

.header.isScrolled {
  background: rgba(5, 5, 5, 0.72);
  backdrop-filter: blur(16px);
  border-bottom-color: rgba(255,255,255,0.08);
}
```

## Hook

```ts
import { useEffect, useState } from 'react';

export function useHeaderScrolled() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return isScrolled;
}
```

---

# 3. Hero parallax

## Эффект

ПК двигается от мыши:

```text
X/Y amplitude: 8–16px
smooth transition
mobile: disabled
prefers-reduced-motion: disabled
```

## Hook

```ts
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
      element.style.setProperty('--parallax-x', `0px`);
      element.style.setProperty('--parallax-y', `0px`);
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
```

## CSS

```css
.heroVisualInner {
  transform: translate3d(var(--parallax-x, 0), var(--parallax-y, 0), 0);
  transition: transform 180ms ease-out;
}
```

---

# 4. RGB pulse

## Эффект

```text
opacity: 0.75 → 1
filter brightness: 1 → 1.15
duration: 3s
infinite alternate
```

## CSS

```css
@keyframes rgbPulse {
  from {
    opacity: 0.75;
    filter: brightness(1);
  }
  to {
    opacity: 1;
    filter: brightness(1.15);
  }
}

.rgbPulse {
  animation: rgbPulse 3s ease-in-out infinite alternate;
}
```

---

# 5. Hero background slow scale

## CSS

```css
@keyframes heroBgScale {
  from {
    transform: scale(1.03);
  }
  to {
    transform: scale(1);
  }
}

.heroBg {
  animation: heroBgScale 10s ease-out both;
}
```

---

# 6. Initial hero text animation

## CSS

```css
@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.heroBadge,
.heroTitle,
.heroSubtitle,
.heroActions,
.heroMetrics {
  opacity: 0;
  animation: fadeUp 700ms var(--ease-premium) forwards;
}

.heroBadge { animation-delay: 40ms; }
.heroTitle { animation-delay: 100ms; }
.heroSubtitle { animation-delay: 200ms; }
.heroActions { animation-delay: 300ms; }
.heroMetrics { animation-delay: 400ms; }
```

---

# 7. Card hover

```css
.card {
  transition:
    transform 250ms ease,
    border-color 250ms ease,
    box-shadow 250ms ease;
}

.card:hover {
  transform: translateY(-6px) scale(1.01);
  border-color: rgba(255,255,255,0.16);
  box-shadow: 0 24px 80px rgba(0,229,255,0.12);
}

.cardVisual {
  transition: transform 500ms ease;
}

.card:hover .cardVisual {
  transform: scale(1.04);
}
```

---

# 8. Button hover

```css
.button {
  transition:
    transform 220ms ease,
    background 220ms ease,
    color 220ms ease,
    box-shadow 220ms ease;
}

.button:hover {
  transform: scale(1.02);
}
```

---

# 9. Mobile menu animation

```css
.mobileMenu {
  opacity: 0;
  transform: translateY(-8px);
  pointer-events: none;
  transition:
    opacity 200ms ease-out,
    transform 200ms ease-out;
}

.mobileMenu.isOpen {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}
```

