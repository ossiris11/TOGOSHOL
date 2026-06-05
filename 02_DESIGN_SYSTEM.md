# TOGOSHOL — Design System

## Общий стиль

Визуальный стиль сайта:

- dark premium tech;
- high-end gaming;
- cyber luxury;
- cinematic hardware;
- clean interface;
- дорогой минимализм;
- тёмный фон;
- cyan / blue / violet glow;
- стекло, металл, RGB;
- крупная типографика;
- много воздуха.

Сайт должен выглядеть как премиальный технологичный бренд, но без перегруза. Визуальный стиль не должен заменять коммерческую ясность: каталог, карточки, условия и CTA должны читаться быстрее, чем декоративные эффекты.

## Цветовая система

Использовать CSS variables.

```css
:root {
  --bg-main: #050505;
  --bg-secondary: #08090B;
  --bg-elevated: #0B0D10;
  --bg-card: #101216;
  --bg-card-soft: #15181D;

  --text-main: #FFFFFF;
  --text-muted: #A5A8AF;
  --text-soft: #777B84;
  --text-inverse: #050505;

  --cyan: #00E5FF;
  --blue: #1F6BFF;
  --violet: #6A35FF;
  --soft-violet: #8B5CFF;
  --green: #4DFF88;
  --red: #FF3B4E;

  --border-soft: rgba(255, 255, 255, 0.08);
  --border-active: rgba(255, 255, 255, 0.16);
  --divider: rgba(255, 255, 255, 0.06);

  --glow-cyan: rgba(0, 229, 255, 0.35);
  --glow-blue: rgba(31, 107, 255, 0.32);
  --glow-violet: rgba(106, 53, 255, 0.35);

  --radius-sm: 14px;
  --radius-md: 20px;
  --radius-lg: 28px;
  --radius-xl: 32px;
  --radius-pill: 999px;

  --container: 1440px;
  --section-y: 128px;
  --section-y-mobile: 76px;

  --ease-premium: cubic-bezier(0.16, 1, 0.3, 1);
}
```

## Фон страницы

```css
body {
  background:
    radial-gradient(circle at 70% 10%, rgba(31, 107, 255, 0.22), transparent 34%),
    radial-gradient(circle at 25% 80%, rgba(106, 53, 255, 0.18), transparent 42%),
    #050505;
  color: var(--text-main);
}
```

Добавить subtle noise overlay:

```css
body::before {
  content: "";
  position: fixed;
  inset: 0;
  pointer-events: none;
  opacity: 0.035;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  z-index: 9999;
}
```

## Типографика

Рекомендуемый шрифт: **Manrope** или **Inter**.

```css
body {
  font-family: Inter, Manrope, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}
```

Размеры desktop:

- H1: 68–84px;
- H2: 42–56px;
- H3: 24–32px;
- body: 16–18px;
- muted: 14–16px;
- nav: 14–15px;
- buttons: 15–16px;
- badges: 11–12px uppercase.

Размеры mobile:

- H1: 42–48px;
- H2: 32–38px;
- H3: 22–26px;
- body: 15–16px.

## Контейнер

```css
.container {
  width: min(100% - 96px, var(--container));
  margin-inline: auto;
}

@media (max-width: 768px) {
  .container {
    width: min(100% - 40px, var(--container));
  }
}
```

## Карточки

```css
.card {
  background: linear-gradient(145deg, rgba(255,255,255,0.055), rgba(255,255,255,0.02));
  border: 1px solid var(--border-soft);
  border-radius: var(--radius-lg);
  padding: 32px;
  overflow: hidden;
  position: relative;
}
```

Hover:

```css
.card {
  transition: transform 250ms ease, border-color 250ms ease, box-shadow 250ms ease;
}

.card:hover {
  transform: translateY(-6px) scale(1.01);
  border-color: var(--border-active);
  box-shadow: 0 24px 80px rgba(0, 229, 255, 0.12);
}
```

## Кнопки

Primary:

```css
.buttonPrimary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 52px;
  padding: 16px 28px;
  border-radius: 999px;
  border: 1px solid #FFFFFF;
  background: #FFFFFF;
  color: #050505;
  font-weight: 650;
  text-decoration: none;
  transition: transform 220ms ease, background 220ms ease, box-shadow 220ms ease;
}

.buttonPrimary:hover {
  transform: scale(1.02);
  background: #EDEDED;
  box-shadow: 0 16px 50px rgba(255,255,255,0.14);
}
```

Secondary:

```css
.buttonSecondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 52px;
  padding: 16px 28px;
  border-radius: 999px;
  border: 1px solid rgba(255,255,255,0.22);
  background: transparent;
  color: #FFFFFF;
  font-weight: 650;
  text-decoration: none;
  transition: transform 220ms ease, background 220ms ease, color 220ms ease;
}

.buttonSecondary:hover {
  transform: scale(1.02);
  background: #FFFFFF;
  color: #050505;
}
```

## Бейджи

```css
.badge {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(255,255,255,0.08);
  color: #FFFFFF;
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.badgeAvailable {
  background: rgba(77,255,136,0.12);
  color: #4DFF88;
}
```

## Breakpoints

```css
@media (max-width: 1180px) {}
@media (max-width: 900px) {}
@media (max-width: 768px) {}
@media (max-width: 480px) {}
```

## Запреты по дизайну

Не использовать:

- светлый фон;
- кислотную перегрузку;
- бесконтрольную сетку из десятков карточек без фильтров;
- длинные SEO-тексты;
- хаотичные RGB-анимации;
- сложные мегаменю;
- баннеры в стиле дешёвого магазина;
- много разных цветов одновременно.

## Коммерческая витрина

Если на сайте есть реальные товары, дизайн должен поддерживать каталог:

- карточка товара всегда показывает цену, статус и ключевые характеристики;
- фото ПК важнее абстрактного glow;
- фильтры и сортировка должны выглядеть как часть премиального интерфейса, а не как техническая форма;
- на первом экране показывать только рекомендованные сборки, полный каталог выносить ниже;
- CTA карточек должны быть одинаково заметны и вести в контактный сценарий.
