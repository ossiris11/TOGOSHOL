# TOGOSHOL Backend Plan

План backend-разработки для сайта TOGOSHOL. Цель: добавить управляемый каталог, заявки, отзывы, метрики и отдельную админ-панель, не ломая текущие верхние блоки сайта и не усложняя проект регистрацией пользователей.

## 1. Главные принципы

- Не превращаем сайт в маркетплейс. Основной сценарий покупки остается простым: выбрать сборку или конфигуратор, затем перейти в диалог VK / Telegram / Max.
- Не делаем регистрацию клиентов. Клиенты не создают аккаунты, не входят в личный кабинет и не хранят пароли.
- Админка отдельной страницей: `/admin`. Она не смешивается с публичным лендингом.
- На лендинге не должно быть ссылок, кнопок входа или визуальных намеков на админку. Вход только по прямому URL `/admin`.
- Верхние блоки не ломаем. Hero, быстрые CTA, первый экран и каталог должны продолжать работать даже если backend временно недоступен.
- Отзывы полезны, но вторичны. Они проходят модерацию и не должны менять структуру первых экранов.
- Отзывы можно подтягивать из внешних источников, включая Avito, если это получится реализовать легально и технически устойчиво.
- Данные должны быть редактируемыми через удобные формы, а не через ручное изменение `src/data/vkProducts.ts`.
- MVP делаем простым, но с нормальной основой под рост.

## 2. Рекомендуемый стек

Текущий frontend: React + TypeScript + Vite.

Для backend:

- Runtime: Node.js.
- API framework: Fastify.
- Database: SQLite на старте.
- ORM/query layer: Prisma.
- Auth админки: один admin password из `.env`, HttpOnly session cookie.
- Валидация: Zod.
- Upload изображений: локальная папка `uploads/` на старте.
- Метрики: внутренняя таблица событий, без внешней аналитики на первом этапе.

Почему так:

- SQLite достаточно для локальной витрины, каталога, заявок, отзывов и базовой статистики.
- Prisma даст понятную схему и миграции.
- Fastify легкий и не раздувает проект.
- Один пароль для админки решает задачу без регистрации, ролей и лишней бюрократии.

Позже SQLite можно заменить на PostgreSQL без переписывания UI и API-контракта.

## 3. Структура будущего проекта

```text
TOGOSHOL/
  server/
    src/
      app.ts
      server.ts
      config.ts
      db.ts
      routes/
        adminAuth.ts
        pageBlocks.ts
        products.ts
        requests.ts
        reviews.ts
        metrics.ts
        uploads.ts
      services/
        productService.ts
        requestService.ts
        reviewService.ts
        metricsService.ts
      schemas/
        productSchemas.ts
        requestSchemas.ts
        reviewSchemas.ts
      middleware/
        requireAdmin.ts
    prisma/
      schema.prisma
      migrations/
    uploads/
  src/
    admin/
      AdminApp.tsx
      pages/
        DashboardPage.tsx
        PageBlocksPage.tsx
        ProductsPage.tsx
        ProductEditorPage.tsx
        ReviewsPage.tsx
        RequestsPage.tsx
        SettingsPage.tsx
      components/
        AdminLayout.tsx
        DataTable.tsx
        StatCard.tsx
        ProductPicker.tsx
        ProductForm.tsx
        ReviewModerationList.tsx
```

Frontend можно оставить одним Vite-приложением и добавить route `/admin`. Backend будет отдавать API на `/api`.

## 4. Модель данных

### Product

Товар / сборка ПК.

```text
id
title
slug
status: available | preorder | hidden | archived
badge
price
priceText
oldPrice
imageUrl
gallery[]
cpu
gpu
ram
storage
psu
cooling
caseName
description
shortDescription
specs[]
class: fullhd | qhd | top | work | custom
scenario
sortOrder
isFeatured
heroSlot
featuredSlot
sourceType: manual | vk_import
externalId
createdAt
updatedAt
deletedAt
```

Важно: удаление лучше делать мягким через `deletedAt`, чтобы случайно не потерять товар навсегда.

### CustomerRequest

Заявка из карточки товара или конфигуратора.

```text
id
status: new | in_progress | done | spam | archived
source: product | configurator | final_cta | contact
name
contact
contactType
message
budget
game
resolution
partsCondition
ram
storage
productId
utmSource
utmMedium
utmCampaign
pagePath
ipHash
userAgent
createdAt
updatedAt
```

### Review

Отзывы с модерацией.

```text
id
status: pending | published | rejected | hidden
authorName
authorLink
rating
text
imageUrl
source: manual | vk | telegram | screenshot
externalUrl
externalId
productId
sortOrder
isPinned
createdAt
updatedAt
publishedAt
```

На публичном сайте показываем только `published`.

Avito:

- Можно добавить источник `avito`, если Avito дает подходящий публичный или партнерский способ получения отзывов.
- Если официального API для отзывов нет или правила площадки запрещают автоматический сбор, делаем ручной импорт: админ добавляет текст, рейтинг, ссылку на источник и скриншот.
- Любой импорт из Avito должен идти через модерацию, чтобы на сайт не попали случайные, устаревшие или неподходящие отзывы.
- В админке нужно показывать источник отзыва: manual, VK, Telegram, Avito, screenshot.

### MetricEvent

Внутренняя простая аналитика.

```text
id
type
pagePath
productId
requestId
metaJson
ipHash
userAgent
createdAt
```

Типы событий:

```text
page_view
product_view
product_cta_click
contact_click_vk
contact_click_telegram
contact_click_max
configurator_submit
request_created
review_seen
```

### AdminSession

Сессии админки.

```text
id
tokenHash
expiresAt
createdAt
lastSeenAt
ipHash
userAgent
```

## 5. API

### Public API

```text
GET    /api/products
GET    /api/products/:id
GET    /api/page-blocks
GET    /api/reviews
POST   /api/requests
POST   /api/metrics/events
```

Публичный каталог возвращает только товары со статусами `available` и `preorder`.

### Admin API

```text
POST   /api/admin/login
POST   /api/admin/logout
GET    /api/admin/me

GET    /api/admin/dashboard

GET    /api/admin/page-blocks
PATCH  /api/admin/page-blocks

GET    /api/admin/products
POST   /api/admin/products
GET    /api/admin/products/:id
PATCH  /api/admin/products/:id
DELETE /api/admin/products/:id
POST   /api/admin/products/:id/restore
PATCH  /api/admin/products/reorder

GET    /api/admin/requests
PATCH  /api/admin/requests/:id
DELETE /api/admin/requests/:id

GET    /api/admin/reviews
POST   /api/admin/reviews
PATCH  /api/admin/reviews/:id
DELETE /api/admin/reviews/:id
PATCH  /api/admin/reviews/reorder
POST   /api/admin/reviews/import

POST   /api/admin/uploads/images
```

## 6. Админ-панель

Админка должна быть мощной по содержанию, но не перегруженной визуально. Главный стиль: темная рабочая панель, плотная сетка, понятные таблицы, быстрые действия.

### Общий layout

- Левое меню: Дашборд, Блоки сайта, Товары, Заявки, Отзывы, Медиа, Настройки.
- Верхняя панель: поиск, быстрый переход на сайт, logout.
- Контентная зона: без лишних декоративных анимаций.
- Таблицы с фильтрами, сортировкой и массовыми действиями.
- Формы в отдельных страницах или широких drawer-панелях.

### Дашборд

Разделы:

- Метрики за сегодня / 7 дней / 30 дней.
- Просмотры сайта.
- Клики по VK / Telegram / Max.
- Количество новых заявок.
- Топ товаров по просмотрам.
- Топ товаров по кликам.
- Последние заявки.
- Последние отзывы на модерации.

### Блоки сайта

Этот раздел нужен, чтобы управлять тем, какие компьютеры попадают в верхние и заметные блоки лендинга, без правки кода.

Редактируемые блоки:

- Hero / верхний блок: главный выделенный ПК.
- Featured builds / рекомендуемые сборки: 3-6 компьютеров.
- Каталог: порядок показа по умолчанию.
- Final CTA: рекомендуемая сборка или диапазон бюджета.

Функции:

- Выбрать товар из списка через Product Picker.
- Быстро видеть цену, статус, фото, CPU/GPU выбранного ПК.
- Перетаскивать порядок карточек в блоке.
- Убрать товар из блока, не удаляя его из каталога.
- Запретить выбор скрытых и архивных товаров для публичных блоков.
- Показывать предупреждение, если у выбранного товара нет фото, цены или ключевых характеристик.

Важно: этот редактор меняет только состав блоков. Он не должен ломать верстку hero, структуру первого экрана и базовые CTA.

### Товары

Функции:

- Создать товар.
- Редактировать товар.
- Скрыть / опубликовать.
- Архивировать / восстановить.
- Удалить мягко.
- Загрузить основное фото.
- Добавить галерею.
- Управлять бейджем.
- Управлять статусом: в наличии, под заказ, скрыт, архив.
- Управлять сортировкой.
- Отметить как рекомендуемый.
- Фильтры по цене, статусу, классу, GPU, наличию фото.

Форма товара:

- Основное: название, статус, цена, бейдж, короткое описание.
- Характеристики: CPU, GPU, RAM, SSD, PSU, охлаждение, корпус.
- Коммерция: сценарий, класс сборки, CTA-текст.
- Медиа: основное изображение, галерея.
- SEO/служебное: slug, source, externalId.

### Заявки

Функции:

- Видеть все заявки в таблице.
- Фильтровать по статусу, источнику и дате.
- Менять статус: новая, в работе, завершена, спам, архив.
- Открывать карточку заявки.
- Видеть связанный товар.
- Видеть параметры конфигуратора.
- Быстро копировать контакт.

### Отзывы

Функции:

- Создать отзыв вручную.
- Модерировать новые отзывы.
- Импортировать отзыв из внешнего источника, если источник разрешен.
- Публиковать, скрывать, отклонять.
- Закреплять важные отзывы.
- Привязывать отзыв к товару.
- Управлять порядком показа.
- Добавлять скриншот или фото.
- Указывать источник: вручную, VK, Telegram, Avito, скриншот.
- Для Avito хранить ссылку на источник, если она доступна.

Публичный сайт:

- Показывает только опубликованные отзывы.
- Не перестраивает верхние блоки.
- Может показывать 3-6 лучших отзывов в текущем нижнем блоке social proof.

### Медиа

На первом этапе можно сделать просто upload внутри формы товара/отзыва.

Позже:

- Библиотека загруженных изображений.
- Удаление неиспользуемых файлов.
- Проверка размера.
- Генерация webp/thumbnail.

## 7. Безопасность

- `ADMIN_PASSWORD` хранится только в `.env`.
- Пароль сравнивается через hash.
- Сессия хранится в HttpOnly cookie.
- Cookie: `httpOnly`, `sameSite=lax`, `secure` в production.
- Все admin routes защищены `requireAdmin`.
- Upload принимает только изображения.
- Ограничить размер файла.
- Rate limit на login, requests и metrics.
- Не хранить VK token в frontend.
- Не хранить Avito cookies, токены или приватные данные в frontend.
- Не делать парсинг Avito, если это нарушает правила площадки или нестабильно для production.
- `.env`, `uploads/private`, database-файлы и ключи должны быть в `.gitignore`.

## 8. Интеграция с текущим frontend

### Этап 1

Оставить текущий `src/data/vkProducts.ts` как fallback.

Логика:

```text
1. frontend пробует GET /api/products
2. если backend отвечает, показывает данные из API
3. если backend недоступен, показывает vkProducts.ts
```

Так верх сайта и каталог не ломаются.

### Этап 2

Перевести каталог на backend как основной источник данных.

### Этап 3

Оставить fallback только для dev/аварийного режима.

### 404 page

Добавить отдельную страницу ошибки для неизвестных маршрутов.

Требования:

- Тема: рыжий кот рядом с компьютером.
- Не использовать ее как маркетинговый экран.
- Дать понятные действия: вернуться на главную, открыть каталог, написать в контакт.
- Визуал можно сделать как raster image или аккуратную иллюстрацию, но страница должна быть легкой и не мешать основному сайту.

## 9. Метрики

Собираем только полезные продуктовые события:

- просмотр страницы;
- просмотр товара;
- клик по CTA товара;
- клик по контактам;
- отправка заявки;
- отправка конфигуратора;
- просмотр отзывов.

Не собираем лишние персональные данные. IP хранить как hash, а не открытым текстом.

В админке показывать:

- конверсию из просмотра товара в CTA;
- популярные сборки;
- каналы связи по кликам;
- динамику заявок;
- источники заявок.

## 10. Очередность разработки

### Milestone 1. Backend skeleton

- Добавить `server/`.
- Настроить Fastify.
- Настроить Prisma + SQLite.
- Добавить health endpoint: `GET /api/health`.
- Добавить env config.
- Добавить scripts в `package.json`.

### Milestone 2. Products API

- Описать Prisma model `Product`.
- Сделать seed из текущего `src/data/vkProducts.ts`.
- Реализовать public `GET /api/products`.
- Реализовать admin CRUD товаров.
- Подключить frontend catalog к API с fallback.

### Milestone 3. Admin auth

- Добавить login/logout.
- Добавить HttpOnly session.
- Защитить admin API.
- Сделать страницу `/admin/login`.

### Milestone 4. Admin products UI

- Сделать layout админки.
- Сделать таблицу товаров.
- Сделать форму создания/редактирования товара.
- Сделать статусы, фильтры, поиск и сортировку.
- Сделать upload основного изображения.

### Milestone 4.5. Admin page blocks UI

- Сделать раздел "Блоки сайта".
- Сделать выбор компьютеров для hero и featured blocks.
- Сделать drag-and-drop порядок рекомендуемых сборок.
- Подключить публичный frontend к `GET /api/page-blocks` с fallback.

### Milestone 5. Requests

- Добавить model `CustomerRequest`.
- Подключить формы сайта к `POST /api/requests`.
- Сделать список заявок в админке.
- Добавить смену статусов.

### Milestone 6. Reviews

- Добавить model `Review`.
- Сделать public `GET /api/reviews`.
- Сделать admin CRUD и модерацию.
- Подключить текущий блок отзывов к API с fallback.
- Добавить ручной импорт Avito-отзывов через форму: текст, рейтинг, ссылка, скриншот.
- Отложить автоматический импорт Avito до проверки API/правил площадки.

### Milestone 7. Metrics

- Добавить model `MetricEvent`.
- Добавить `POST /api/metrics/events`.
- Поставить события на CTA, товары, заявки.
- Сделать dashboard с метриками.

### Milestone 8. Polish and deploy readiness

- Проверить production build.
- Добавить backup database.
- Добавить README по запуску backend.
- Добавить smoke tests для API.
- Добавить basic error states на frontend.

## 11. Что не делаем в MVP

- Регистрацию клиентов.
- Личный кабинет.
- Онлайн-оплату.
- Корзину.
- Сложные роли админов.
- Интеграцию с CRM.
- Полную внешнюю аналитику.
- Автоматическую синхронизацию VK market по расписанию.
- Автоматический парсинг Avito без проверки правил и стабильного источника.

Это можно добавить позже, когда станет понятно, что реально нужно бизнесу.

## 12. Минимальный критерий готовности

Backend можно считать готовым для пробного использования, когда:

- админ входит по паролю;
- товары создаются, редактируются, скрываются и удаляются через админку;
- публичный каталог берет товары из API;
- если API упал, сайт не разваливается и показывает fallback;
- заявки попадают в админку;
- отзывы можно модерировать;
- дашборд показывает базовые метрики;
- `npm run build` проходит;
- есть инструкция запуска frontend + backend.
