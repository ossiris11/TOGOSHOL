# TOGOSHOL Production Runbook

Small-production запуск для локального сайта с 5-10 клиентами в день.

## Что уже есть

- Frontend: React + Vite production build.
- Backend: Fastify API.
- Database: SQLite в `server/data/togoshol.sqlite`.
- Admin: отдельная страница `/admin`, на лендинге ссылок на вход нет.
- Uploads: `server/uploads`.
- Auth: один admin password из `.env`, HttpOnly cookie session.
- Rate limit: включен на API, login, заявки и метрики.

## Первый запуск

### Автоматический запуск на VDS

На чистом Debian/Ubuntu сервере:

```bash
sudo bash scripts/install-vds.sh
```

Установщик спросит:

- домен;
- git repository URL;
- branch;
- директорию установки;
- внутренний порт;
- Linux user для systemd service;
- пароль админки;
- session secret;
- нужен ли HTTPS через Let's Encrypt;
- нужен ли firewall;
- нужен ли ежедневный backup.

После установки сайт будет в автозапуске сервера через systemd:

```bash
systemctl status togoshol.service
journalctl -u togoshol.service -f
```

Nginx будет проксировать домен на локальный backend.

### Ручной запуск

```bash
npm ci
npm run db:generate
npm run db:push
npm run db:seed
npm run build
npm run start:prod
```

После запуска:

```text
http://127.0.0.1:8787/
http://127.0.0.1:8787/admin
```

## `.env`

Файл `.env` не коммитится. Минимальные значения:

```text
DATABASE_URL="file:../server/data/togoshol.sqlite"
SERVER_HOST="127.0.0.1"
SERVER_PORT="8787"
PUBLIC_ORIGIN="http://127.0.0.1:8787"
ADMIN_PASSWORD="1111000010"
SESSION_SECRET="change-this-long-random-secret"
UPLOAD_DIR="server/uploads"
```

Текущий первичный пароль админки для локального проекта: `1111000010`.

Пароль можно сменить в `/admin` -> `Настройки` -> `Пароль админки`. После смены пароль хранится в базе как hash.

Для реального production `ADMIN_PASSWORD` лучше заменить на длинный, а `SESSION_SECRET` должен быть минимум 32 символа.

## Проверка здоровья

```bash
curl http://127.0.0.1:8787/api/health
curl http://127.0.0.1:8787/api/products
```

## Backup

Остановить сервер и сохранить:

```text
server/data/togoshol.sqlite
server/uploads/
```

Для 5-10 клиентов в день достаточно ежедневного копирования этих путей.

Автоустановщик может создать cron backup в `/var/backups/togoshol`.

## Что не хранить в git

- `.env`
- `server/data/`
- `server/uploads/`
- любые ключи и токены
