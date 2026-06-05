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
    FeaturedBuilds/
      FeaturedBuilds.tsx
      FeaturedBuilds.css
    ProductCatalog/
      ProductCatalog.tsx
      ProductCatalog.css
    ProductFilters/
      ProductFilters.tsx
      ProductFilters.css
    ProductCard/
      ProductCard.tsx
      ProductCard.css
    Configurator/
      Configurator.tsx
      Configurator.css
    CustomBuild/
      CustomBuild.tsx
      CustomBuild.css
    WhyTogoshol/
      WhyTogoshol.tsx
      WhyTogoshol.css
    TrustConditions/
      TrustConditions.tsx
      TrustConditions.css
    OrderProcess/
      OrderProcess.tsx
      OrderProcess.css
    Reviews/
      Reviews.tsx
      Reviews.css
    Faq/
      Faq.tsx
      Faq.css
    FinalCta/
      FinalCta.tsx
      FinalCta.css
    Footer/
      Footer.tsx
      Footer.css
  data/
    products.ts
    featuredBuilds.ts
    benefits.ts
    conditions.ts
    steps.ts
    reviews.ts
    faq.ts
  lib/
    products.ts
    contacts.ts
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

Если проект маленький, можно объединять CSS и данные, но нельзя превращать всю страницу в один огромный компонент.

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
        <FeaturedBuilds />
        <ProductCatalog />
        <Configurator />
        <CustomBuild />
        <WhyTogoshol />
        <TrustConditions />
        <OrderProcess />
        <Reviews />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
```

---

# Contacts

## Назначение

Хранить все каналы связи в одном месте.

```ts
export const contacts = {
  vk: 'https://vk.me/tog_pc',
  telegram: '',
  max: '',
  phone: '',
  email: '',
};
```

Не размазывать URL и телефоны по компонентам. Если канала нет, не показывать кнопку-заглушку.

---

# Header

## State

- `isScrolled`
- `isMobileMenuOpen`

## Links

```ts
const navLinks = [
  { label: 'Сборки', href: '#catalog' },
  { label: 'Конфигуратор', href: '#configurator' },
  { label: 'Под заказ', href: '#custom' },
  { label: 'Почему мы', href: '#why' },
  { label: 'Как заказать', href: '#process' },
];
```

## Поведение

- sticky top;
- blur при scrollY > 12;
- mobile menu;
- плавное открытие mobile menu;
- CTA ведёт в рабочий канал связи.

---

# Hero

## Состав

- badge;
- H1;
- subtitle;
- CTA group;
- metrics;
- визуал ПК или активной сборки;
- короткая лента рекомендованных сборок.

## Требования

- H1 должен быть главным визуальным акцентом;
- hero не должен превращаться в полный каталог;
- на desktop работает parallax;
- на mobile parallax отключён;
- CTA “Смотреть сборки” ведёт в `#catalog`;
- CTA “Подобрать ПК” ведёт в `#configurator`.

---

# PcMockup

## Назначение

Fallback, если нет настоящего фото ПК.

## Визуал

Сделать через CSS:

- корпус;
- glass panel;
- 3 RGB fans;
- внутренние линии как cable / cooling;
- glow;
- reflection.

Использовать реальные фото, когда они есть.

---

# FeaturedBuilds

## Назначение

Показать 3-6 рекомендуемых сборок на первом экране или сразу после него.

## Props / Data

Использует нормализованные товары из каталога. Не хранит отдельные фейковые сборки, если есть реальные данные.

## UI

- компактные карточки;
- цена;
- CPU / GPU;
- статус;
- CTA “Написать по сборке”;
- клик по карточке может менять активную сборку в hero.

---

# ProductCatalog

## Назначение

Основная витрина всех сборок.

## State

- search query;
- budget filter;
- class filter;
- sort mode;
- visible count.

## Поведение

- фильтры и сортировка работают на нормализованных данных;
- при изменении фильтров visible count сбрасывается;
- сначала показывать ограниченное число карточек;
- остальные раскрывать через “Показать ещё”;
- если нет результатов, показывать пустое состояние и CTA в подбор.

---

# ProductFilters

## Controls

- search input;
- segmented budget filter;
- segmented class filter;
- select / segmented sort.

## Filters

```ts
const budgetFilters = ['Все', 'до 60k', '60-90k', '90-150k', '150k+'];
const classFilters = ['Все', 'Full HD', '2K', 'Топ', 'Работа'];
const sortOptions = ['Рекомендуем', 'Дешевле', 'Дороже', 'Мощнее'];
```

---

# ProductCard

## Props

```ts
interface ProductCardProps {
  id: string;
  title: string;
  price: number;
  priceText: string;
  status: 'available' | 'order' | 'unknown';
  image?: string;
  className?: string;
  scenario?: string;
  specs: {
    cpu?: string;
    gpu?: string;
    ram?: string;
    storage?: string;
    psu?: string;
    cooling?: string;
  };
}
```

## UI

- image top;
- status badge;
- title;
- price;
- chips: class, CPU, GPU, RAM, SSD;
- CTA “Написать по сборке”;
- secondary action “Подобрать похожую”.

## Запрет

Не показывать в карточке:

- рекламные хвосты из VK;
- эмодзи-строки;
- “Конфигурация:”;
- обрывки описаний;
- внешнюю ссылку на VK Market как основной сценарий покупки.

---

# Configurator

## Назначение

Помочь выбрать ПК без знания комплектующих.

## State

- budget;
- game / task;
- resolution;
- parts condition;
- RAM;
- SSD;
- case style.

## Result

- recommended tier;
- short explanation;
- warning for unrealistic budget;
- nearby real products;
- copy configuration button;
- contact CTA.

## Accessibility

- radio groups должны иметь `role="radiogroup"`;
- опции должны иметь `aria-checked` или быть настоящими `input`;
- кнопка копирования должна сообщать состояние.

---

# CustomBuild

## Назначение

Одна сильная секция про индивидуальную сборку.

## Состав

- заголовок;
- короткий текст;
- 4 пункта процесса;
- CTA;
- hardware visual или фото рабочего процесса.

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
    title: 'Подбор без лишней переплаты',
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

# TrustConditions

## Назначение

Показать конкретные условия покупки.

## Data

```ts
export const conditions = [
  {
    title: 'Гарантия',
    text: 'Гарантия на сборку и комплектующие. Условия уточняются по конкретной конфигурации.',
  },
  {
    title: 'Сроки',
    text: 'Готовые ПК можно забрать быстрее. Индивидуальная сборка зависит от наличия комплектующих.',
  },
  {
    title: 'Оплата',
    text: 'Финальная стоимость фиксируется после согласования конфигурации.',
  },
  {
    title: 'Выдача и доставка',
    text: 'Выдача в Великом Новгороде. Доставку можно обсудить отдельно.',
  },
];
```

---

# OrderProcess

## Data

```ts
export const steps = [
  { number: '01', title: 'Заявка', text: 'Пишешь бюджет, задачи и пожелания.' },
  { number: '02', title: 'Подбор', text: 'Получаешь 1-2 варианта конфигурации.' },
  { number: '03', title: 'Согласование', text: 'Фиксируем комплектующие, стоимость, сроки и условия.' },
  { number: '04', title: 'Сборка и тест', text: 'Собираем, настраиваем и проверяем ПК под нагрузкой.' },
  { number: '05', title: 'Передача', text: 'Отдаём компьютер, объясняем базовые моменты и остаёмся на связи.' },
];
```

---

# Reviews

## Назначение

Социальное доказательство.

## Требования

- не использовать фейковые отзывы;
- если отзывов нет, скрыть секцию;
- источник отзывов должен быть понятен;
- можно показывать отзывы из VK при наличии разрешения и корректного источника.

---

# Faq

## Назначение

Закрыть типовые вопросы до обращения.

## UI

- accordion;
- один вопрос раскрывается без скачков layout;
- на mobile легко нажимать.

---

# FinalCta

## Назначение

Последний сильный призыв к действию.

## Визуал

- большой контрастный блок;
- 2-3 рабочих CTA;
- короткий текст;
- без декоративной перегрузки.

---

# Footer

## Назначение

Закрыть контакты и навигацию.

## Не добавлять

- лишние соцсети без ссылок;
- фейковый телефон;
- длинную юридическую информацию без необходимости;
- ссылки на внешние товарные источники как основной путь покупки.
