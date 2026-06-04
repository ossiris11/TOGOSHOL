# TOGOSHOL — Components

## Рекомендуемая структура файлов

```text
src/
  app/
    App.tsx
  components/
    Header/
      Header.tsx
      Header.css
    Hero/
      Hero.tsx
      Hero.css
    PcMockup/
      PcMockup.tsx
      PcMockup.css
    ReadyBuilds/
      ReadyBuilds.tsx
      ReadyBuilds.css
    BuildCard/
      BuildCard.tsx
      BuildCard.css
    CustomBuild/
      CustomBuild.tsx
      CustomBuild.css
    WhyTogoshol/
      WhyTogoshol.tsx
      WhyTogoshol.css
    OrderProcess/
      OrderProcess.tsx
      OrderProcess.css
    FinalCta/
      FinalCta.tsx
      FinalCta.css
    Footer/
      Footer.tsx
      Footer.css
  data/
    builds.ts
    benefits.ts
    steps.ts
  hooks/
    useScrollReveal.ts
    useHeaderScrolled.ts
    useHeroParallax.ts
  styles/
    globals.css
    variables.css
    utilities.css
  main.tsx
```

Если проект маленький, можно сократить структуру, но не складывать всю страницу в один огромный файл.

---

# App

## Назначение

Собирает страницу из секций.

```tsx
export function App() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <ReadyBuilds />
        <CustomBuild />
        <WhyTogoshol />
        <OrderProcess />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
```

---

# Header

## Props

Можно без props.

## State

- `isScrolled`
- `isMobileMenuOpen`

## Поведение

- sticky top;
- blur при scrollY > 12;
- mobile menu;
- плавное открытие mobile menu.

## Links

```ts
const navLinks = [
  { label: 'Сборки', href: '#builds' },
  { label: 'Под заказ', href: '#custom' },
  { label: 'Почему мы', href: '#why' },
  { label: 'Как заказать', href: '#process' },
];
```

---

# Hero

## Состав

- badge;
- H1;
- subtitle;
- CTA group;
- metrics;
- PC visual.

## Требования

- H1 должен быть главным визуальным акцентом;
- не перегружать текст;
- справа должен быть премиальный mockup ПК;
- на desktop работает parallax;
- на mobile parallax отключён.

---

# PcMockup

## Назначение

Заменяет настоящие изображения ПК, если их нет.

## Визуал

Сделать через CSS:

- корпус;
- glass panel;
- 3 RGB fans;
- внутренние линии как cable / cooling;
- glow;
- reflection.

## Важные классы

```text
.pcMockup
.pcCase
.pcGlass
.pcFan
.pcGlow
.pcReflection
```

## Анимации

- RGB pulse;
- subtle floating;
- parallax wrapper in Hero.

---

# ReadyBuilds

## Data

Использовать `src/data/builds.ts`.

```ts
export const builds = [
  {
    badge: 'В наличии',
    badgeType: 'available',
    title: 'START',
    subtitle: 'Для Full HD игр и учёбы',
    specs: ['RTX / Radeon на выбор', '16–32 ГБ RAM', 'SSD NVMe', 'Тихое охлаждение'],
    price: 'от 75 000 ₽',
    cta: 'Уточнить наличие',
  },
  {
    badge: 'Хит',
    badgeType: 'default',
    title: 'PRO',
    subtitle: 'Для 2K-гейминга, стриминга и монтажа',
    specs: ['Мощная видеокарта', '32 ГБ RAM', 'Быстрый NVMe SSD', 'RGB / airflow корпус'],
    price: 'от 125 000 ₽',
    cta: 'Подобрать PRO',
  },
  {
    badge: 'Под заказ',
    badgeType: 'default',
    title: 'ULTRA',
    subtitle: 'Максимальная производительность и премиальная эстетика',
    specs: ['Флагманская видеокарта', '32–64 ГБ RAM', 'СЖО / кастомное охлаждение', 'Индивидуальный дизайн'],
    price: 'от 190 000 ₽',
    cta: 'Собрать ULTRA',
  },
];
```

---

# BuildCard

## Props

```ts
interface BuildCardProps {
  badge: string;
  badgeType?: 'default' | 'available';
  title: string;
  subtitle: string;
  specs: string[];
  price: string;
  cta: string;
}
```

## UI

- badge top;
- title;
- subtitle;
- mini visual;
- specs list;
- price;
- CTA.

## Accessibility

CTA должен быть `a` или `button` с понятным `aria-label`.

---

# CustomBuild

## Назначение

Одна широкая карточка индивидуального подбора.

## Layout

Desktop:

```text
text 50% / visual 50%
```

Mobile:

```text
text сверху / visual снизу
```

---

# WhyTogoshol

## Data

```ts
export const benefits = [
  {
    title: 'Локально в Великом Новгороде',
    text: 'Можно быстро обсудить сборку, забрать ПК и получить помощь после покупки.',
  },
  {
    title: 'Без лишней переплаты',
    text: 'Подбираем железо под реальные задачи, а не ради красивых цифр в описании.',
  },
  {
    title: 'Тестируем перед выдачей',
    text: 'Проверяем стабильность, температуры, шум и корректность сборки.',
  },
  {
    title: 'Готово к запуску',
    text: 'Устанавливаем систему, драйверы и базовые настройки, чтобы ПК был готов сразу.',
  },
];
```

---

# OrderProcess

## Data

```ts
export const steps = [
  {
    number: '01',
    title: 'Заявка',
    text: 'Пишешь бюджет, задачи и пожелания.',
  },
  {
    number: '02',
    title: 'Подбор',
    text: 'Получаешь 1–2 варианта конфигурации.',
  },
  {
    number: '03',
    title: 'Сборка',
    text: 'Собираем, настраиваем и тестируем компьютер.',
  },
  {
    number: '04',
    title: 'Передача',
    text: 'Отдаём ПК, объясняем базовые моменты и остаёмся на связи.',
  },
];
```

---

# FinalCta

## Назначение

Последний сильный призыв к действию.

## Визуал

- большая карточка;
- central layout;
- gradient glow;
- две кнопки;
- короткий текст.

---

# Footer

## Назначение

Минимально закрыть контакты и навигацию.

## Не добавлять

- много правовой информации;
- длинные колонки;
- лишние ссылки;
- социальные сети без данных.

