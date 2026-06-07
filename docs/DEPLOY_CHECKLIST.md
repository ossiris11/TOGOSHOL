# TOGOSHOL Deploy Checklist

Короткий чеклист перед выкладкой и после обновления production.

## Before Deploy

- Проверить рабочую ветку и отсутствие случайных файлов: `git status -sb`.
- Убедиться, что `.env` не попал в Git.
- Задать production values:
  - `DATABASE_URL`
  - `PUBLIC_ORIGIN`
  - `ADMIN_PASSWORD` или `ADMIN_PASSWORD_HASH`
  - `SESSION_SECRET` длиной не меньше 32 символов
  - `METRIC_RETENTION_DAYS`
- Проверить реальный основной домен `https://tog-pc.ru/` в `index.html`, `public/robots.txt`, `public/sitemap.xml`.
- Установщик спрашивает основной домен и redirect-домены. Для текущего запуска: primary `tog-pc.ru`, redirect `tog-pc.online`.
- Выполнить:

```bash
npm ci
npm run db:generate
npm run db:migrate
npm test
npm run build
```

## Deploy

- Обновить код на сервере.
- Выполнить `npm ci`, `npm run db:generate`, `npm run db:migrate`, `npm run build`.
- Перезапустить сервис:

```bash
systemctl restart togoshol.service
systemctl status togoshol.service --no-pager -l
```

## After Deploy

- Проверить smoke:

```bash
SMOKE_BASE_URL="https://tog-pc.ru" npm run smoke:prod
```

- Проверить последний бэкап:

```bash
BACKUP_DIR="/var/backups/togoshol" npm run backup:check
```

- Проверить вручную:
  - главная открывается по HTTPS;
  - `/admin` открывается только по прямому URL;
  - вход в админку работает;
  - создание тестовой заявки работает;
  - upload изображения в админке работает;
  - `robots.txt` и `sitemap.xml` отдаются с `https://tog-pc.ru/`;
  - `tog-pc.online` не создает дубль сайта и редиректит на основной домен.

- Повесить uptime alert на cron или systemd timer:

```bash
SMOKE_BASE_URL="https://tog-pc.ru" UPTIME_WEBHOOK_URL="https://ваш-webhook" npm run monitor:uptime
```

## Rollback

- Вернуть предыдущий Git commit/tag.
- Выполнить `npm ci`, `npm run db:generate`, `npm run build`.
- Перезапустить `togoshol.service`.
- Если повреждены runtime-данные, восстановить SQLite и uploads из последнего проверенного бэкапа.
