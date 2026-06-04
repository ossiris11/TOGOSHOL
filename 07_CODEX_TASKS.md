# TOGOSHOL — Tasks for Codex

## Основная задача

Сделай frontend-часть минималистичного премиального лендинга **TOGOSHOL** для продажи игровых ПК в Великом Новгороде.

Цель — чистый landing, а не интернет-магазин.

---

# Шаг 1. Проверить проект

Сначала изучи структуру проекта.

Если проект уже создан:

- не ломай текущую архитектуру;
- используй существующий стек;
- добавь/обнови компоненты лендинга.

Если проект пустой:

- создай React + TypeScript + Vite;
- настрой базовые стили;
- сделай компонентную структуру.

---

# Шаг 2. Создать структуру компонентов

Минимальная структура:

```text
Header
Hero
PcMockup
ReadyBuilds
BuildCard
CustomBuild
WhyTogoshol
OrderProcess
FinalCta
Footer
```

Данные вынести в массивы:

```text
builds.ts
benefits.ts
steps.ts
```

---

# Шаг 3. Сделать дизайн-систему

Добавь CSS variables:

```css
--bg-main: #050505;
--bg-secondary: #08090B;
--bg-card: #101216;
--bg-card-soft: #15181D;
--text-main: #FFFFFF;
--text-muted: #A5A8AF;
--text-soft: #777B84;
--cyan: #00E5FF;
--blue: #1F6BFF;
--violet: #6A35FF;
--green: #4DFF88;
--border-soft: rgba(255,255,255,0.08);
--border-active: rgba(255,255,255,0.16);
--ease-premium: cubic-bezier(0.16, 1, 0.3, 1);
```

---

# Шаг 4. Сделать Hero

Hero должен быть главным экраном.

Обязательно:

- H1: “Игровые ПК в Великом Новгороде”;
- subtitle;
- 2 CTA;
- 3 метрики;
- визуал ПК справа;
- parallax visual на desktop;
- RGB pulse;
- fade-up появление текста.

Если изображений нет, создай CSS/SVG mockup игрового ПК.

---

# Шаг 5. Сделать секцию готовых сборок

Сделай 3 карточки:

- START;
- PRO;
- ULTRA.

Не добавлять больше трёх карточек.

В каждой карточке:

- badge;
- title;
- subtitle;
- mini visual;
- 4 specs;
- price;
- CTA.

---

# Шаг 6. Сделать Custom Build

Одна широкая карточка:

- “Соберём ПК под твою задачу”;
- короткий текст;
- 4 пункта;
- CTA;
- hardware visual справа.

---

# Шаг 7. Сделать Why TOGOSHOL

4 карточки:

- Локально в Великом Новгороде;
- Без лишней переплаты;
- Тестируем перед выдачей;
- Готово к запуску.

---

# Шаг 8. Сделать Order Process

Timeline из 4 шагов:

- Заявка;
- Подбор;
- Сборка;
- Передача.

Desktop — горизонтально.

Mobile — вертикально.

---

# Шаг 9. Сделать Final CTA и Footer

Final CTA:

- большой заголовок;
- короткий subtitle;
- Telegram button;
- Call button.

Footer:

- TOGOSHOL;
- описание;
- контакты;
- разделы;
- copyright.

---

# Шаг 10. Реализовать анимации

Обязательно:

1. Reveal on scroll.
2. Header blur on scroll.
3. Hero parallax.
4. RGB pulse.
5. Card hover lift.
6. Button hover scale.
7. Mobile menu animation.
8. prefers-reduced-motion.

---

# Шаг 11. Адаптивность

Проверить:

- desktop 1440px;
- laptop 1280px;
- tablet 768px;
- mobile 390px;
- mobile 360px.

На mobile:

- одна колонка;
- H1 42–48px;
- кнопки full-width или в колонку;
- карточки по одной;
- parallax отключён;
- меню через burger.

---

# Шаг 12. Финальный polish

После основной реализации не добавляй новые секции.

Дожми только:

- отступы;
- typography scale;
- hover;
- glow;
- mobile spacing;
- smoothness анимаций;
- контраст текста;
- кликабельность CTA.

---

# Запреты

Не делать:

- большой каталог;
- корзину;
- оплату;
- регистрацию;
- личный кабинет;
- новости;
- блог;
- клиентов;
- 10+ карточек;
- длинные SEO-тексты;
- сложный backend;
- визуальный шум.

---

# Финальный критерий

Готовая страница должна ощущаться как премиальный dark-tech лендинг 2026 года для локальной продажи игровых ПК, но оставаться чистой, лёгкой и понятной.

