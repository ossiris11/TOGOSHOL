# TOGOSHOL Audit Tasks

Практический backlog после аудита сайта, backend и frontend.

## P0 - перед production

- [x] Добавить базовые API smoke-тесты.
- [x] Добавить CI для `npm test` и `npm run build`.
- [x] Добавить `.gitignore` для локальных архивов и standalone-сборок.
- [x] Добавить SEO-минимум: `robots.txt`, `sitemap.xml`, Open Graph, canonical.
- [x] Зафиксировать реальный production-домен и заменить `https://togoshol.ru/`, если домен другой.
- [x] Убрать публичный стартовый пароль из README или явно пометить его как dev-only.
- [x] Добавить restore-проверку бэкапа SQLite и uploads.
- [x] Добавить production smoke-check после деплоя.

## P1 - backend

- [x] Возвращать аккуратные `404/409` для основных ошибок товаров.
- [x] Расширить обработку Prisma-ошибок на заявки, отзывы и комплектующие.
- [x] Добавить retention/очистку старых `MetricEvent`.
- [x] Добавить audit log для действий админки.
- [x] Улучшить CSRF-защиту админских write-запросов.
- [x] Добавить медиатеку, удаление неиспользуемых uploads и thumbnail/WebP pipeline.

## P1 - frontend

- [x] Добавить e2e/screenshot-проверку главной и админки на mobile/desktop.
- [x] Проверить и оптимизировать LCP hero asset.
- [x] Добавить Open Graph image после выбора стабильного публичного изображения.
- [x] Заменить ручной `window.location.pathname` routing на явный router, когда страниц станет больше.
- [x] Добить empty/error states в админке и публичных API-блоках.

## P2 - качество проекта

- [x] Добавить ESLint/Prettier или аналогичный lint/format контур.
- [x] Добавить Prisma migrations вместо schema push для production-изменений.
- [x] Подключить мониторинг ошибок и uptime alert.
- [x] Документировать release/deploy checklist.
