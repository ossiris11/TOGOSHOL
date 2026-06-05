# TOGOSHOL

Сайт, backend API и админ-панель для TOGOSHOL: локального проекта по продаже готовых и кастомных игровых ПК в Великом Новгороде.

Проект готовится под небольшой production-запуск: лендинг, каталог, конфигуратор, заявки, отзывы, загрузка изображений, управление товарами и комплектующими через отдельную админку.

## Что внутри

- Лендинг с верхним блоком, подборками ПК, каталогом, конфигуратором, отзывами, FAQ и формами заявки.
- Отдельная админ-панель `/admin`, без ссылок на вход на лендинге.
- Управление товарами, комплектующими, отзывами, заявками, метриками, настройками и блоками главной страницы.
- Конфигуратор и блок "под заказ" используют доступные комплектующие из админки.
- Backend API для каталога, заявок, отзывов, настроек, загрузок и админских операций.
- SQLite-хранилище для простого запуска на ВДС без отдельного сервера БД.
- Production-установщик для ВДС с nginx, systemd, HTTPS и бэкапами.

## Стек

- React
- TypeScript
- Vite
- Fastify
- Prisma
- SQLite
- CSS
- nginx + systemd для production-запуска

## Локальный запуск

Установить зависимости:

```bash
npm ci
```

Подготовить базу данных:

```bash
npm run db:generate
npm run db:push
npm run db:seed
```

Запустить backend API:

```bash
npm run dev:server
```

В отдельном терминале запустить frontend:

```bash
npm run dev -- --port 5173
```

Адреса для проверки:

- Сайт: `http://127.0.0.1:5173/`
- Админка: `http://127.0.0.1:5173/admin`
- Backend healthcheck: `http://127.0.0.1:8787/api/health`

Текущий стартовый пароль админки: `1111000010`.
После входа пароль можно поменять в настройках панели.

## Переменные окружения

Для локального запуска можно использовать `.env.example` как шаблон.
Боевой `.env` не коммитится в Git.

Пример:

```env
DATABASE_URL="file:../server/data/togoshol.sqlite"
SERVER_HOST="127.0.0.1"
SERVER_PORT="8787"
PUBLIC_ORIGIN="https://your-domain.ru"
ADMIN_PASSWORD="1111000010"
SESSION_SECRET="change-this-long-random-secret"
UPLOAD_DIR="server/uploads"
```

Важно:

- `ADMIN_PASSWORD` задает стартовый пароль администратора.
- `SESSION_SECRET` должен быть длинным случайным значением на production.
- `PUBLIC_ORIGIN` должен совпадать с доменом сайта на ВДС.
- `.env`, база, загрузки, логи и сборка не должны попадать в репозиторий.

## Production-развертывание на ВДС

Перед установкой:

1. Купленный домен должен смотреть на IP сервера через DNS `A`-запись.
2. На сервере должен быть доступ по SSH.
3. Для приватного репозитория на сервере должен быть настроен SSH-ключ GitHub.

Команды на сервере:

```bash
git clone git@github.com:ossiris11/TOGOSHOL.git
cd TOGOSHOL
sudo bash scripts/install-vds.sh
```

Установщик задаст вопросы:

- домен сайта;
- URL Git-репозитория;
- ветка для развертывания;
- папка установки;
- внутренний порт backend;
- Linux-пользователь для сервиса;
- пароль администратора;
- `SESSION_SECRET`;
- включать ли HTTPS;
- включать ли firewall;
- включать ли ежедневный бэкап.

Что делает установщик:

- ставит системные пакеты, Node.js 22, nginx и ufw;
- клонирует или обновляет репозиторий;
- создает production `.env`;
- готовит SQLite-базу;
- запускает seed-данные;
- собирает frontend и backend;
- создает systemd-сервис `togoshol.service`;
- включает автозапуск сайта после перезагрузки сервера;
- настраивает nginx reverse proxy;
- опционально выпускает HTTPS-сертификат Let's Encrypt;
- опционально включает ежедневный бэкап базы и загрузок.

После установки:

```bash
systemctl status togoshol.service
journalctl -u togoshol.service -f
systemctl restart togoshol.service
```

Адреса после production-развертывания:

- Сайт: `https://ваш-домен`
- Админка: `https://ваш-домен/admin`

## Ручной production-запуск

Если нужно запустить проект без установщика:

```bash
npm ci
npm run db:generate
npm run db:push
npm run db:seed
npm run build
npm run start:prod
```

Для нормального production-запуска все равно рекомендуется использовать nginx и systemd, чтобы сайт был в автозапуске и восстанавливался после перезагрузки.

## Данные и бэкапы

Основные runtime-данные:

- SQLite-база: `server/data/togoshol.sqlite`
- Загруженные изображения: `server/uploads/`

Их нужно бэкапить. Установщик может настроить ежедневный cron-бэкап в `/var/backups/togoshol`.

В Git не добавлять:

- `.env`
- реальные ключи и токены;
- `server/data/`
- `server/uploads/`
- `dist/`
- `server/dist/`
- `node_modules/`
- логи.

## Админ-панель

Админка находится по адресу `/admin`.
На лендинге нет кнопок входа в админку.

Основные разделы:

- метрики и статистика;
- редактирование верхних блоков и подборок на главной;
- товары и карточки ПК;
- комплектующие для кастомной сборки;
- заявки клиентов;
- отзывы и модерация;
- загрузка изображений;
- настройки проекта и смена пароля.

## Полезные команды

```bash
npm run dev
npm run dev:server
npm run db:generate
npm run db:push
npm run db:seed
npm run build
npm run start:prod
npm run import:vk
```

Импорт товаров из VK/VK Market запускается только при наличии токена:

```bash
VK_TOKEN=your_token npm run import:vk
```

Реальные токены не коммитить.

## Документация

- `docs/BACKEND_PLAN.md` - план развития backend.
- `docs/PRODUCTION_RUNBOOK.md` - подробный production runbook.
- `docs/API_CONTRACT.md` - контракт API.
- `00_README.md` - `08_QA_CHECKLIST.md` - исходные проектные материалы и чеклисты.
- `09_SITE_AUDIT_FIXES.md` - аудит фронта, исправления и дальнейшие улучшения.
