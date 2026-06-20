import { useEffect, useMemo, useState } from 'react';
import amdLogo from '../assets/amd-logo.svg';
import intelLogo from '../assets/intel-logo.svg';
import { resolveCatalogProductImage } from '../lib/catalogImages';
import { notifyProductDataChanged } from '../lib/productSync';
import './AdminApp.css';

type AdminTab = 'dashboard' | 'blocks' | 'products' | 'components' | 'requests' | 'reviews' | 'media' | 'settings';

type AdminProduct = {
  id: string;
  title: string;
  status: string;
  badge: string;
  badgeType: 'default' | 'available';
  price: number;
  priceText: string;
  imageUrl?: string | null;
  cpu: string;
  gpu: string;
  ram: string;
  storage: string;
  psu: string;
  cooling: string;
  caseName: string;
  description: string;
  shortDescription: string;
  specs: string[];
  productClass: string;
  scenario: string;
  sortOrder: number;
  isFeatured: boolean;
  sourceType: string;
  externalId?: string | null;
  deletedAt?: string | null;
};

type AdminRequest = {
  id: string;
  status: string;
  source: string;
  name: string;
  contact: string;
  message: string;
  budget?: number | null;
  game?: string | null;
  resolution?: string | null;
  createdAt: string;
  product?: { title: string; priceText: string } | null;
};

type AdminReview = {
  id: string;
  status: string;
  authorName: string;
  authorLink?: string | null;
  rating: number;
  text: string;
  source: string;
  externalUrl?: string | null;
  imageUrl?: string | null;
  isPinned: boolean;
  sortOrder: number;
  productId?: string | null;
};

type AdminComponent = {
  id: string;
  category: string;
  title: string;
  subtitle: string;
  price: number;
  wattage: number;
  tags: string[];
  status: string;
  sortOrder: number;
  description: string;
  deletedAt?: string | null;
};

type AdminUpload = {
  name: string;
  url: string;
  thumbUrl: string;
  size: number;
  updatedAt: string;
};

type DashboardPayload = {
  stats: Record<string, number>;
  server: {
    hostname: string;
    platform: string;
    uptimeSeconds: number;
    cpuCount: number;
    loadAverage1m: number;
    cpuLoadPercent: number;
    totalMemory: number;
    freeMemory: number;
    usedMemory: number;
    memoryUsedPercent: number;
    processMemoryRss: number;
  };
  chart: Array<{ date: string; pageViews: number; clicks: number; requests: number }>;
  recentRequests: Array<{ id: string; status: string; source: string; contact: string; budget?: number | null; productTitle: string; createdAt: string }>;
  topProducts: Array<{ productId: string | null; title: string; count: number }>;
  topPages: Array<{ path: string; count: number }>;
  contacts: Array<{ type: string; count: number }>;
};

type ProductDraft = Omit<AdminProduct, 'id' | 'specs' | 'deletedAt'> & { id?: string; specsText: string };
type ReviewDraft = Omit<AdminReview, 'id'> & { id?: string };

const tabs: Array<{ id: AdminTab; label: string }> = [
  { id: 'dashboard', label: 'Дашборд' },
  { id: 'blocks', label: 'Блоки сайта' },
  { id: 'products', label: 'Товары' },
  { id: 'components', label: 'Комплектующие' },
  { id: 'requests', label: 'Заявки' },
  { id: 'reviews', label: 'Отзывы' },
  { id: 'media', label: 'Медиа' },
  { id: 'settings', label: 'Настройки' },
];

const componentCategories = [
  ['gpu', 'Видеокарта'],
  ['cpu', 'Процессор'],
  ['motherboard', 'Материнская плата'],
  ['ram', 'Оперативная память'],
  ['storage', 'Накопитель'],
  ['psu', 'Блок питания'],
  ['cooling', 'Охлаждение'],
  ['case', 'Корпус'],
  ['os', 'Система'],
  ['service', 'Сервис'],
] as const;

const emptyComponent = {
  category: 'gpu',
  title: '',
  subtitle: '',
  price: 0,
  wattage: 0,
  tagsText: '',
  status: 'available',
  sortOrder: 1000,
  description: '',
};

const emptyProduct: ProductDraft = {
  title: '',
  status: 'available',
  badge: 'В наличии',
  badgeType: 'available',
  price: 0,
  priceText: '',
  imageUrl: '',
  cpu: '',
  gpu: '',
  ram: '',
  storage: '',
  psu: '',
  cooling: '',
  caseName: '',
  description: '',
  shortDescription: '',
  specsText: '',
  productClass: 'custom',
  scenario: '',
  sortOrder: 1000,
  isFeatured: false,
  sourceType: 'manual',
  externalId: '',
};

const emptyReview: ReviewDraft = {
  status: 'pending',
  authorName: '',
  authorLink: '',
  rating: 5,
  text: '',
  source: 'avito',
  externalUrl: '',
  imageUrl: '',
  isPinned: false,
  sortOrder: 1000,
  productId: '',
};

function readCookie(name: string) {
  return document.cookie
    .split(';')
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

async function adminApi<T>(url: string, options?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 8000);
  const method = options?.method?.toUpperCase() || 'GET';
  const headers = new Headers(options?.headers);
  if (options?.body && !(options.body instanceof FormData)) headers.set('Content-Type', 'application/json');
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    headers.set('X-TOGOSHOL-Admin', '1');
    const csrfToken = readCookie('togoshol_admin_csrf');
    if (csrfToken) headers.set('X-CSRF-Token', decodeURIComponent(csrfToken));
  }

  try {
    const response = await fetch(url, {
      cache: 'no-store',
      credentials: 'include',
      ...options,
      headers,
      signal: options?.signal || controller.signal,
    });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    return response.json() as Promise<T>;
  } finally {
    window.clearTimeout(timeout);
  }
}

function productToDraft(product: AdminProduct): ProductDraft {
  return {
    ...product,
    imageUrl: product.imageUrl || '',
    externalId: product.externalId || '',
    specsText: product.specs.join('\n'),
  };
}

function draftToPayload(draft: ProductDraft) {
  return {
    ...draft,
    price: Number(draft.price) || 0,
    sortOrder: Number(draft.sortOrder) || 1000,
    specs: draft.specsText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean),
    imageUrl: draft.imageUrl || null,
    externalId: draft.externalId || null,
    isFeatured: undefined,
    specsText: undefined,
    id: undefined,
  };
}

function rub(value?: number | null) {
  if (!value) return 'без бюджета';
  return new Intl.NumberFormat('ru-RU').format(value) + ' ₽';
}

function compactNumber(value: number) {
  return new Intl.NumberFormat('ru-RU', { notation: value >= 10000 ? 'compact' : 'standard' }).format(value);
}

function formatBytes(value: number) {
  if (!Number.isFinite(value) || value <= 0) return '0 МБ';
  const units = ['Б', 'КБ', 'МБ', 'ГБ'];
  let size = value;
  let unit = 0;
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit += 1;
  }
  return `${size.toFixed(unit < 2 ? 0 : 1)} ${units[unit]}`;
}

function formatUptime(seconds: number) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  if (days > 0) return `${days} д ${hours} ч`;
  return `${hours} ч ${Math.floor((seconds % 3600) / 60)} мин`;
}

function contactLabel(type: string) {
  const labels: Record<string, string> = {
    contact_click_vk: 'VK',
    contact_click_telegram: 'Telegram',
    contact_click_instagram: 'Instagram',
    contact_click_avito: 'Avito',
    contact_click_max: 'Max',
    product_cta_click: 'CTA товаров',
    product_details_click: 'Детали товара',
    custom_pc_modal_open: 'Модалка custom PC',
  };
  return labels[type] || type;
}

export function AdminApp() {
  const [authChecked, setAuthChecked] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [apiNotice, setApiNotice] = useState('');
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  useEffect(() => {
    adminApi('/api/admin/me')
      .then(() => setAuthenticated(true))
      .catch((error) => {
        setAuthenticated(false);
        if (error instanceof DOMException && error.name === 'AbortError') setApiNotice('API не ответил за 8 секунд. Проверь, что backend запущен.');
      })
      .finally(() => setAuthChecked(true));
  }, []);

  const login = async () => {
    setLoginError('');
    try {
      await adminApi('/api/admin/login', { method: 'POST', body: JSON.stringify({ password }) });
      setAuthenticated(true);
      setApiNotice('');
    } catch {
      setLoginError('Пароль не подошел или backend не отвечает');
    }
  };

  const logout = async () => {
    await adminApi('/api/admin/logout', { method: 'POST' }).catch(() => undefined);
    setAuthenticated(false);
  };

  if (!authChecked) {
    return (
      <main className="adminBoot">
        <section className="adminBootPanel">
          <span>TOGOSHOL Admin</span>
          <h1>Проверяем сессию</h1>
          <p>Если экран висит дольше нескольких секунд, проверь backend API.</p>
        </section>
      </main>
    );
  }

  if (!authenticated) {
    return (
      <main className="adminLogin">
        <section className="adminLoginPanel">
          <span>TOGOSHOL Admin</span>
          <b className="adminVersionBadge">pre-test версия</b>
          <h1>Вход в панель</h1>
          <p>На лендинге вход не показывается. Доступ только по прямому адресу.</p>
          {apiNotice && <p className="adminNotice">{apiNotice}</p>}
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && void login()} placeholder="Пароль администратора" />
          <button type="button" onClick={login}>Войти</button>
          {loginError && <strong>{loginError}</strong>}
        </section>
      </main>
    );
  }

  return (
    <main className="adminShell">
      <aside className="adminSidebar">
        <div className="adminBrand">
          <b>TOGOSHOL</b>
          <span>control room</span>
        </div>
        <nav>
          {tabs.map((tab) => (
            <button className={activeTab === tab.id ? 'isActive' : ''} key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}>
              {tab.label}
            </button>
          ))}
        </nav>
      </aside>

      <section className="adminMain">
        <header className="adminTopbar">
          <div>
            <span>Админ-панель</span>
            <b className="adminVersionBadge">pre-test версия</b>
            <h1>{tabs.find((tab) => tab.id === activeTab)?.label}</h1>
          </div>
          <div>
            <a href="/" target="_blank" rel="noreferrer">Открыть сайт</a>
            <button type="button" onClick={logout}>Выйти</button>
          </div>
        </header>

        {activeTab === 'dashboard' && <DashboardPage />}
        {activeTab === 'blocks' && <BlocksPage />}
        {activeTab === 'products' && <ProductsPage />}
        {activeTab === 'components' && <ComponentsPage />}
        {activeTab === 'requests' && <RequestsPage />}
        {activeTab === 'reviews' && <ReviewsPage />}
        {activeTab === 'media' && <MediaPage />}
        {activeTab === 'settings' && <SettingsPage />}
      </section>
    </main>
  );
}

function MediaPage() {
  const [items, setItems] = useState<AdminUpload[]>([]);
  const [message, setMessage] = useState('');

  const load = () => adminApi<{ items: AdminUpload[] }>('/api/admin/uploads/images').then((payload) => setItems(payload.items));
  useEffect(() => void load(), []);

  const copyUrl = async (url: string) => {
    await navigator.clipboard.writeText(url);
    setMessage('URL скопирован');
  };

  const remove = async (name: string) => {
    await adminApi(`/api/admin/uploads/images/${encodeURIComponent(name)}`, { method: 'DELETE' });
    setMessage('Файл удален');
    await load();
  };

  return (
    <AdminPanel title="Медиатека" note="Загруженные изображения. Новые JPG/PNG/WebP конвертируются в WebP и получают миниатюру.">
      {message && <p className="adminNotice">{message}</p>}
      {items.length === 0 ? (
        <p className="adminEmptyState">Загруженных изображений пока нет. Добавь фото в форме товара или отзыва.</p>
      ) : (
        <div className="mediaGrid">
          {items.map((item) => (
            <article className="mediaCard" key={item.name}>
              <img src={item.thumbUrl} alt="" loading="lazy" decoding="async" />
              <div>
                <strong>{item.name}</strong>
                <span>{Math.round(item.size / 1024)} KB · {new Date(item.updatedAt).toLocaleString('ru-RU')}</span>
              </div>
              <div className="mediaActions">
                <button type="button" onClick={() => copyUrl(item.url)}>URL</button>
                <button type="button" onClick={() => remove(item.name)}>Удалить</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </AdminPanel>
  );
}

function ComponentsPage() {
  const [items, setItems] = useState<AdminComponent[]>([]);
  const [draft, setDraft] = useState(emptyComponent as typeof emptyComponent & { id?: string });
  const [filter, setFilter] = useState('all');
  const [message, setMessage] = useState('');

  const load = () => adminApi<{ items: AdminComponent[] }>('/api/admin/components').then((payload) => setItems(payload.items));
  useEffect(() => void load(), []);

  const visible = filter === 'all' ? items : items.filter((item) => item.category === filter);

  const save = async () => {
    const payload = {
      ...draft,
      price: Number(draft.price) || 0,
      wattage: Number(draft.wattage) || 0,
      sortOrder: Number(draft.sortOrder) || 1000,
      tags: draft.tagsText.split(',').map((tag) => tag.trim()).filter(Boolean),
      tagsText: undefined,
      id: undefined,
    };
    const url = draft.id ? `/api/admin/components/${draft.id}` : '/api/admin/components';
    await adminApi(url, { method: draft.id ? 'PATCH' : 'POST', body: JSON.stringify(payload) });
    setMessage('Комплектующая сохранена');
    setDraft(emptyComponent);
    await load();
  };

  const edit = (item: AdminComponent) => {
    setDraft({
      id: item.id,
      category: item.category,
      title: item.title,
      subtitle: item.subtitle,
      price: item.price,
      wattage: item.wattage,
      tagsText: item.tags.join(', '),
      status: item.status,
      sortOrder: item.sortOrder,
      description: item.description,
    });
  };

  const remove = async (id: string) => {
    await adminApi(`/api/admin/components/${id}`, { method: 'DELETE' });
    await load();
  };

  return (
    <div className="adminGrid">
      <AdminPanel title="Доступные комплектующие" note="Эти позиции появляются в модальном сборщике на лендинге.">
        <select className="adminInput" value={filter} onChange={(event) => setFilter(event.target.value)}>
          <option value="all">Все категории</option>
          {componentCategories.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <div className="adminTable adminTableWide">
          {visible.map((item) => (
            <div className={item.deletedAt ? 'isMuted' : ''} key={item.id}>
              <span>{componentCategories.find(([value]) => value === item.category)?.[1] || item.category}</span>
              <b>{item.title}</b>
              <small>{rub(item.price)} · {item.wattage ? `${item.wattage}W` : 'без W'} · {item.status}</small>
              <button type="button" onClick={() => edit(item)}>Редактировать</button>
              <button type="button" onClick={() => void remove(item.id)}>Архив</button>
            </div>
          ))}
        </div>
      </AdminPanel>

      <AdminPanel title={draft.id ? 'Редактировать комплектующую' : 'Новая комплектующая'} note={message}>
        <div className="adminForm">
          <select value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })}>
            {componentCategories.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
          <input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="Название" />
          <input value={draft.subtitle} onChange={(event) => setDraft({ ...draft, subtitle: event.target.value })} placeholder="Короткое пояснение для клиента" />
          <div className="adminSplit">
            <input type="number" value={draft.price} onChange={(event) => setDraft({ ...draft, price: Number(event.target.value) })} placeholder="Цена" />
            <input type="number" value={draft.wattage} onChange={(event) => setDraft({ ...draft, wattage: Number(event.target.value) })} placeholder="W, если важно" />
          </div>
          <input value={draft.tagsText} onChange={(event) => setDraft({ ...draft, tagsText: event.target.value })} placeholder="Теги через запятую: 2K, тихо, RGB" />
          <textarea value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} placeholder="Описание / заметка" />
          <select value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value })}>
            <option value="available">Доступно</option>
            <option value="hidden">Скрыто</option>
            <option value="archived">Архив</option>
          </select>
          <button className="adminPrimary" type="button" onClick={save}>Сохранить комплектующую</button>
        </div>
      </AdminPanel>
    </div>
  );
}

function DashboardPage() {
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [updatedAt, setUpdatedAt] = useState('');

  useEffect(() => {
    let alive = true;
    const load = () => {
      adminApi<{ ok: boolean } & DashboardPayload>('/api/admin/dashboard')
        .then((payload) => {
          if (!alive) return;
          setData(payload);
          setUpdatedAt(new Date().toLocaleTimeString('ru-RU'));
        })
        .catch(() => undefined);
    };
    load();
    const timer = window.setInterval(load, 30000);
    return () => {
      alive = false;
      window.clearInterval(timer);
    };
  }, []);

  if (!data) return <AdminPanel title="Данные загружаются" />;

  return (
    <div className="adminStack">
      <div className="dashboardHero">
        <div>
          <span>Обновление каждые 30 секунд</span>
          <h2>Сводка сайта и сервера</h2>
          <p>Визиты, клики, заявки и техническая нагрузка. Последнее обновление: {updatedAt || 'сейчас'}.</p>
        </div>
        <button type="button" onClick={() => window.location.reload()}>Обновить</button>
      </div>
      <div className="adminStats">
        <Stat label="Переходы сегодня" value={data.stats.pageViewsToday} />
        <Stat label="Переходы за 7 дней" value={data.stats.pageViews7d} />
        <Stat label="Клики за 7 дней" value={data.stats.clicks7d} />
        <Stat label="Новые заявки" value={data.stats.requestsNew} />
        <Stat label="Активные товары" value={data.stats.productsActive} />
        <Stat label="Отзывы на модерации" value={data.stats.reviewsPending} />
      </div>
      <div className="adminGrid dashboardGrid">
        <AdminPanel title="Нагрузка сервера" note={`${data.server.hostname} · ${data.server.platform} · uptime ${formatUptime(data.server.uptimeSeconds)}`}>
          <div className="serverMeters">
            <Meter label={`CPU · ${data.server.cpuCount} потоков`} value={data.server.cpuLoadPercent} note={`load 1m: ${data.server.loadAverage1m.toFixed(2)}`} />
            <Meter label="RAM" value={data.server.memoryUsedPercent} note={`${formatBytes(data.server.usedMemory)} из ${formatBytes(data.server.totalMemory)}`} />
            <Meter label="Node RSS" value={Math.min(100, Math.round((data.server.processMemoryRss / data.server.totalMemory) * 100))} note={formatBytes(data.server.processMemoryRss)} />
          </div>
        </AdminPanel>
        <AdminPanel title="Каналы и CTA за 30 дней">
          <DataRows rows={data.contacts.map((item) => [contactLabel(item.type), `${item.count} кликов`])} empty="Кликов пока нет" />
        </AdminPanel>
      </div>
      <AdminPanel title="График активности за 14 дней" note="Синие столбцы - переходы, белые - клики, зеленые - заявки.">
        <MetricsChart points={data.chart} />
      </AdminPanel>
      <AdminPanel title="Последние заявки">
        <DataRows rows={data.recentRequests.map((item) => [item.contact, item.productTitle || item.source, rub(item.budget), new Date(item.createdAt).toLocaleString('ru-RU')])} empty="Заявок пока нет" />
      </AdminPanel>
      <div className="adminGrid dashboardGrid">
        <AdminPanel title="Топ товаров по активности">
          <DataRows rows={data.topProducts.map((item) => [item.title, `${item.count} событий`])} empty="Активности по товарам пока нет" />
        </AdminPanel>
        <AdminPanel title="Топ страниц по переходам">
          <DataRows rows={data.topPages.map((item) => [item.path, `${item.count} переходов`])} empty="Переходов пока нет" />
        </AdminPanel>
      </div>
    </div>
  );
}

function BlocksPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [blocks, setBlocks] = useState({ heroProductIds: [] as string[], featuredProductIds: [] as string[], finalCtaProductIds: [] as string[] });
  const activeProducts = products.filter((product) => !product.deletedAt && ['available', 'preorder'].includes(product.status));

  const load = () => {
    Promise.all([
      adminApi<{ items: AdminProduct[] }>('/api/admin/products'),
      adminApi<{ blocks: typeof blocks }>('/api/admin/page-blocks'),
    ]).then(([productPayload, blockPayload]) => {
      setProducts(productPayload.items);
      setBlocks(blockPayload.blocks);
    });
  };

  useEffect(load, []);

  const save = async () => {
    await adminApi('/api/admin/page-blocks', { method: 'PATCH', body: JSON.stringify(blocks) });
    notifyProductDataChanged();
    load();
  };

  return (
    <div className="adminStack">
      <AdminPanel title="Hero / верхний блок" note="Выбери главный компьютер. Скрытые и архивные товары не показываются на сайте.">
        <ProductSelect products={activeProducts} ids={blocks.heroProductIds} max={1} onChange={(ids) => setBlocks({ ...blocks, heroProductIds: ids })} />
      </AdminPanel>
      <AdminPanel title="Рекомендуемые сборки" note="3-6 сильных позиций для верхней горизонтальной витрины.">
        <ProductSelect products={activeProducts} ids={blocks.featuredProductIds} max={6} onChange={(ids) => setBlocks({ ...blocks, featuredProductIds: ids })} />
      </AdminPanel>
      <AdminPanel title="Final CTA">
        <ProductSelect products={activeProducts} ids={blocks.finalCtaProductIds} max={1} onChange={(ids) => setBlocks({ ...blocks, finalCtaProductIds: ids })} />
      </AdminPanel>
      <button className="adminPrimary" type="button" onClick={save}>Сохранить блоки сайта</button>
    </div>
  );
}

function ProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [query, setQuery] = useState('');
  const [viewMode, setViewMode] = useState<'active' | 'trash'>('active');
  const [draft, setDraft] = useState<ProductDraft>(emptyProduct);
  const [message, setMessage] = useState('');
  const [uploadMessage, setUploadMessage] = useState('');

  const load = () => adminApi<{ items: AdminProduct[] }>('/api/admin/products').then((payload) => setProducts(payload.items));
  useEffect(() => void load(), []);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return products
      .filter((product) => (viewMode === 'trash' ? Boolean(product.deletedAt) : !product.deletedAt))
      .filter((product) => !needle || [product.title, product.gpu, product.cpu, product.ram, product.storage, product.priceText, product.status].join(' ').toLowerCase().includes(needle));
  }, [products, query, viewMode]);

  const activeCount = products.filter((product) => !product.deletedAt).length;
  const trashCount = products.length - activeCount;

  const editProduct = (product: AdminProduct) => {
    setDraft(productToDraft(product));
    setMessage(`Редактируешь: ${product.title}`);
    setUploadMessage('');
  };

  const createNew = () => {
    setDraft(emptyProduct);
    setMessage('Новый товар');
    setUploadMessage('');
  };

  const save = async () => {
    setMessage('Сохраняю...');
    const method = draft.id ? 'PATCH' : 'POST';
    const url = draft.id ? `/api/admin/products/${draft.id}` : '/api/admin/products';
    try {
      await adminApi(url, { method, body: JSON.stringify(draftToPayload(draft)) });
      notifyProductDataChanged();
      setMessage(draft.id ? 'Товар обновлен' : 'Товар добавлен');
      setDraft(emptyProduct);
      await load();
    } catch {
      setMessage('Не удалось сохранить товар. Проверь обязательные поля.');
    }
  };

  const remove = async (id: string) => {
    await adminApi(`/api/admin/products/${id}`, { method: 'DELETE' });
    notifyProductDataChanged();
    if (draft.id === id) setDraft(emptyProduct);
    setMessage('Товар перемещен в корзину. Через 15 дней он удалится навсегда.');
    await load();
  };

  const restore = async (id: string) => {
    await adminApi(`/api/admin/products/${id}/restore`, { method: 'POST', body: '{}' });
    notifyProductDataChanged();
    setMessage('Товар восстановлен. Статус поставлен "Скрыт", проверь перед публикацией.');
    await load();
  };

  const removeForever = async (id: string) => {
    await adminApi(`/api/admin/products/${id}/permanent`, { method: 'DELETE' });
    notifyProductDataChanged();
    if (draft.id === id) setDraft(emptyProduct);
    setMessage('Товар удален навсегда.');
    await load();
  };

  const upload = async (file: File | null) => {
    if (!file) return;
    setUploadMessage('Загружаю фото...');
    const form = new FormData();
    form.set('file', file);
    try {
      const result = await adminApi<{ url: string }>('/api/admin/uploads/images', { method: 'POST', body: form });
      setDraft((current) => ({ ...current, imageUrl: result.url }));
      setUploadMessage('Фото загружено и подставлено в карточку');
    } catch {
      setUploadMessage('Не удалось загрузить фото. Нужен jpg, png, webp или gif до 6 МБ.');
    }
  };

  return (
    <div className="productsAdmin">
      <AdminPanel title="Товары каталога" note="Выбирай строку для редактирования. Изменения сохраняются только после кнопки сохранения.">
        <div className="productToolbar">
          <input className="adminInput" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Поиск по названию, CPU, GPU, RAM, цене или статусу" />
          <button className="adminPrimary" type="button" onClick={createNew}>Добавить товар</button>
        </div>
        <div className="productModeTabs" role="tablist" aria-label="Режим списка товаров">
          <button className={viewMode === 'active' ? 'isActive' : ''} type="button" onClick={() => setViewMode('active')}>
            Каталог <span>{activeCount}</span>
          </button>
          <button className={viewMode === 'trash' ? 'isActive' : ''} type="button" onClick={() => setViewMode('trash')}>
            Корзина <span>{trashCount}</span>
          </button>
        </div>
        {viewMode === 'trash' && <p className="trashNotice">Товары в корзине автоматически удаляются навсегда через 15 дней. Их можно восстановить до очистки.</p>}
        <div className="productAdminTable" role="table" aria-label="Товары">
          <div className="productAdminHead" role="row">
            <span>Фото</span>
            <span>Товар</span>
            <span>Железо</span>
            <span>Цена</span>
            <span>Статус</span>
            <span>Действия</span>
          </div>
          {filtered.map((product) => (
            <div className={`productAdminRow ${product.deletedAt ? 'isMuted' : ''} ${draft.id === product.id ? 'isSelected' : ''}`} key={product.id} role="row">
              <button className="productThumbButton" type="button" onClick={() => editProduct(product)} aria-label={`Редактировать ${product.title}`}>
                <img src={resolveCatalogProductImage(product.imageUrl, product.price, `${product.id}:${product.title}`)} alt="" />
              </button>
              <div>
                <b>{product.title}</b>
                <small>{product.shortDescription || product.scenario || product.productClass}</small>
              </div>
              <div>
                <span>{product.cpu || 'CPU не указан'}</span>
                <small>{product.gpu || 'GPU не указана'} · {product.ram || 'RAM'} · {product.storage || 'SSD'}</small>
              </div>
              <strong>{product.priceText}</strong>
              <span className={`productAdminStatus is-${product.status}`}>{product.status}</span>
              <div className="productRowActions">
                {!product.deletedAt ? (
                  <>
                    <button type="button" onClick={() => editProduct(product)}>Править</button>
                    <button className="isDanger" type="button" onClick={() => void remove(product.id)}>Удалить</button>
                  </>
                ) : (
                  <>
                    <button type="button" onClick={() => void restore(product.id)}>Вернуть</button>
                    <button className="isDanger" type="button" onClick={() => void removeForever(product.id)}>Навсегда</button>
                  </>
                )}
              </div>
            </div>
          ))}
          {filtered.length === 0 && <p className="adminEmpty">По такому запросу товаров нет.</p>}
        </div>
      </AdminPanel>

      <section className="productEditorPanel">
        <ProductPreview draft={draft} />
        <AdminPanel title={draft.id ? 'Редактировать товар' : 'Добавить товар'} note={message || 'Заполни карточку, загрузи фото и проверь предпросмотр перед сохранением.'}>
          <ProductForm draft={draft} setDraft={setDraft} upload={upload} uploadMessage={uploadMessage} />
          <div className="adminActions productEditorActions">
            <button className="adminPrimary" type="button" onClick={save}>Сохранить товар</button>
            <button type="button" onClick={createNew}>Очистить</button>
          </div>
        </AdminPanel>
      </section>
    </div>
  );
}

function RequestsPage() {
  const [items, setItems] = useState<AdminRequest[]>([]);
  const load = () => adminApi<{ items: AdminRequest[] }>('/api/admin/requests').then((payload) => setItems(payload.items));
  useEffect(() => void load(), []);

  const setStatus = async (id: string, status: string) => {
    await adminApi(`/api/admin/requests/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
    await load();
  };

  return (
    <AdminPanel title="Заявки">
      <div className="adminTable adminTableWide">
        {items.map((item) => (
          <div key={item.id}>
            <span>{item.contact}</span>
            <b>{item.product?.title || item.game || item.source}</b>
            <small>{rub(item.budget)} · {new Date(item.createdAt).toLocaleString('ru-RU')}</small>
            <select value={item.status} onChange={(event) => void setStatus(item.id, event.target.value)}>
              <option value="new">новая</option>
              <option value="in_progress">в работе</option>
              <option value="done">готово</option>
              <option value="spam">спам</option>
              <option value="archived">архив</option>
            </select>
            <p>{item.message}</p>
          </div>
        ))}
      </div>
    </AdminPanel>
  );
}

function ReviewsPage() {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [draft, setDraft] = useState<ReviewDraft>(emptyReview);
  const [message, setMessage] = useState('');
  const load = () => adminApi<{ items: AdminReview[] }>('/api/admin/reviews').then((payload) => setReviews(payload.items));
  useEffect(() => void load(), []);

  const save = async () => {
    const payload = {
      ...draft,
      rating: Number(draft.rating) || 5,
      sortOrder: Number(draft.sortOrder) || 1000,
      authorLink: draft.authorLink || null,
      externalUrl: draft.externalUrl || null,
      imageUrl: draft.imageUrl || null,
      productId: draft.productId || null,
      id: undefined,
    };
    const url = draft.id ? `/api/admin/reviews/${draft.id}` : '/api/admin/reviews';
    await adminApi(url, { method: draft.id ? 'PATCH' : 'POST', body: JSON.stringify(payload) });
    setDraft(emptyReview);
    setMessage('Отзыв сохранен');
    await load();
  };

  const edit = (review: AdminReview) => {
    setDraft({
      id: review.id,
      status: review.status,
      authorName: review.authorName,
      authorLink: review.authorLink || '',
      rating: review.rating,
      text: review.text,
      source: review.source,
      externalUrl: review.externalUrl || '',
      imageUrl: review.imageUrl || '',
      isPinned: review.isPinned,
      sortOrder: review.sortOrder,
      productId: review.productId || '',
    });
    setMessage('');
  };

  const upload = async (file: File | null) => {
    if (!file) return;
    const form = new FormData();
    form.set('file', file);
    const result = await adminApi<{ url: string }>('/api/admin/uploads/images', { method: 'POST', body: form });
    setDraft((current) => ({ ...current, imageUrl: result.url }));
  };

  const patch = async (id: string, status: string) => {
    await adminApi(`/api/admin/reviews/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
    await load();
  };

  return (
    <div className="adminGrid">
      <AdminPanel title={draft.id ? 'Редактировать отзыв' : 'Новый отзыв / скрин'} note={message || 'Для блока лучших отзывов: статус published, источник Avito/VK/Сайт, широкий скрин в поле изображения. Закрепленные идут выше.'}>
        <div className="adminForm">
          <input value={draft.authorName} onChange={(event) => setDraft({ ...draft, authorName: event.target.value })} placeholder="Имя автора" />
          <select value={draft.source} onChange={(event) => setDraft({ ...draft, source: event.target.value })}>
            <option value="avito">Avito</option>
            <option value="vk">VK</option>
            <option value="site">Сайт</option>
            <option value="telegram">Telegram</option>
            <option value="screenshot">Скриншот</option>
            <option value="manual">Вручную</option>
          </select>
          <div className="adminSplit">
            <select value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value })}>
              <option value="pending">На модерации</option>
              <option value="published">Опубликован</option>
              <option value="hidden">Скрыт</option>
              <option value="rejected">Отклонен</option>
            </select>
            <input type="number" min="1" max="5" value={draft.rating} onChange={(event) => setDraft({ ...draft, rating: Number(event.target.value) })} placeholder="Оценка" />
          </div>
          <div className="adminSplit">
            <input type="number" value={draft.sortOrder} onChange={(event) => setDraft({ ...draft, sortOrder: Number(event.target.value) })} placeholder="Порядок" />
            <label className="adminCheckbox">
              <input type="checkbox" checked={draft.isPinned} onChange={(event) => setDraft({ ...draft, isPinned: event.target.checked })} />
              Лучший / закрепить
            </label>
          </div>
          <input value={draft.externalUrl || ''} onChange={(event) => setDraft({ ...draft, externalUrl: event.target.value })} placeholder="Ссылка на источник" />
          <input value={draft.imageUrl || ''} onChange={(event) => setDraft({ ...draft, imageUrl: event.target.value })} placeholder="URL скриншота" />
          <input type="file" accept="image/*" onChange={(event) => void upload(event.target.files?.[0] || null)} />
          <textarea value={draft.text} onChange={(event) => setDraft({ ...draft, text: event.target.value })} placeholder="Текст отзыва" />
          <div className="adminActions">
            <button className="adminPrimary" type="button" onClick={save}>Сохранить отзыв</button>
            <button type="button" onClick={() => setDraft(emptyReview)}>Очистить</button>
          </div>
        </div>
      </AdminPanel>
      <AdminPanel title="Модерация">
        <div className="adminTable adminTableWide">
          {reviews.map((review) => (
            <div key={review.id}>
              <span>{review.authorName}</span>
              <b>{review.source} · {review.rating}/5</b>
              <small>{review.status} · порядок {review.sortOrder}{review.isPinned ? ' · лучший' : ''}</small>
              <button type="button" onClick={() => edit(review)}>Редактировать</button>
              <button type="button" onClick={() => void patch(review.id, 'published')}>Опубликовать</button>
              <button type="button" onClick={() => void patch(review.id, 'hidden')}>Скрыть</button>
              {review.imageUrl && <img className="adminReviewThumb" src={review.imageUrl} alt="" />}
              <p>{review.text}</p>
            </div>
          ))}
        </div>
      </AdminPanel>
    </div>
  );
}

function SettingsPage() {
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const savePassword = async () => {
    setMessage('');
    try {
      await adminApi('/api/admin/password', { method: 'PATCH', body: JSON.stringify({ password }) });
      setPassword('');
      setMessage('Пароль обновлен');
    } catch {
      setMessage('Пароль должен быть минимум 4 символа');
    }
  };

  return (
    <div className="adminStack">
      <AdminPanel title="Пароль админки" note={message || 'Пароль хранится в базе как hash. Стартовый пароль задается через .env или установщик ВДС.'}>
        <div className="adminForm adminNarrowForm">
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Новый пароль" />
          <button className="adminPrimary" type="button" onClick={savePassword}>Сменить пароль</button>
        </div>
      </AdminPanel>
      <AdminPanel title="Production checklist">
        <ul className="adminChecklist">
          <li>`SESSION_SECRET` минимум 32 символа.</li>
          <li>Перед запуском: `npm run db:generate`, `npm run db:push`, `npm run db:seed`, `npm run build`.</li>
          <li>База хранится в `server/data`, uploads в `server/uploads`, обе папки игнорируются git.</li>
          <li>На лендинге нет ссылок на админку. Вход только через `/admin`.</li>
        </ul>
      </AdminPanel>
    </div>
  );
}

function ProductPreview({ draft }: { draft: ProductDraft }) {
  const priceValue = Number(draft.price) || 0;
  const price = draft.priceText || (draft.price ? new Intl.NumberFormat('ru-RU').format(Number(draft.price)) + ' ₽' : '0 ₽');
  const processorBrand = getAdminProcessorBrand(draft.cpu || draft.title);
  const gpuTier = getAdminGpuTier(draft.productClass, priceValue);
  const fps = getAdminFpsEstimate(priceValue, gpuTier);
  const previewImage = resolveCatalogProductImage(draft.imageUrl, priceValue, `${draft.id || 'new-product'}:${draft.title}`);
  const specs = [
    ['GPU', 'Видеокарта', draft.gpu || 'На выбор'],
    ['CPU', 'Процессор', draft.cpu || 'На выбор'],
    ['RAM', 'Память', draft.ram || 'На выбор'],
    ['SSD', 'Накопитель', draft.storage || 'На выбор'],
  ];

  return (
    <section className="adminProductPreview" aria-label="Предпросмотр товара">
      <article className="productCard adminPreviewProductCard">
        <div className="productShowcase">
          <AdminProcessorBrandLogo brand={processorBrand.brand} label={processorBrand.badge} />
          <img className="productImage" src={previewImage} alt="" />
          <div className="productIntro">
            <span>TOG PC ({processorBrand.intro})</span>
            <h3>{getAdminCardTitle(priceValue)}</h3>
            <p>
              <small>от</small>
              {price}
            </p>
          </div>
        </div>

        <div className="productInfo">
          <div className="productMetaLine">
            <span className={`productStatus ${draft.badgeType === 'available' ? 'isAvailable' : ''}`}>{draft.badge || 'В наличии'}</span>
            <span>{gpuTier}</span>
          </div>

          <div className="productActions">
            <span className="productBuyButton">Написать по сборке <span>→</span></span>
            <span className="productDetailsButton">Подробнее о сборке <span>›</span></span>
          </div>

          <div className="productFpsBox">
            <div className="fpsRing">
              <strong>{fps}</strong>
              <small>FPS</small>
            </div>
            <div>
              <b>Показатели в играх</b>
              <span>{getAdminPerformanceLabel(gpuTier)}</span>
            </div>
          </div>

          <dl className="productSpecsList">
            {specs.map(([key, label, value]) => (
              <div key={key}>
                <span className="productSpecIcon" aria-hidden="true">
                  {adminSpecIcons[key] || '•'}
                </span>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </article>
    </section>
  );
}

function getAdminCardTitle(priceValue: number) {
  if (priceValue < 65000) return 'Start';
  if (priceValue < 85000) return 'Medium';
  if (priceValue < 140000) return 'PRO';
  return 'Ultra';
}

function getAdminGpuTier(productClass: string, priceValue: number) {
  if (productClass === 'top') return 'Топ';
  if (productClass === 'qhd') return '2K';
  if (productClass === 'fullhd') return 'Full HD';
  if (priceValue >= 150000) return 'Топ';
  if (priceValue >= 90000) return '2K';
  if (priceValue > 0) return 'Full HD';
  return 'Custom';
}

function getAdminFpsEstimate(priceValue: number, tier: string) {
  const base = tier === 'Топ' ? 170 : tier === '2K' ? 135 : tier === 'Full HD' ? 95 : 110;
  const budgetBoost = Math.min(45, Math.max(0, Math.round((priceValue - 65000) / 4500)));
  return Math.max(60, base + budgetBoost);
}

function getAdminPerformanceLabel(tier: string) {
  if (tier === 'Топ') return '4K, стриминг и тяжелые проекты';
  if (tier === '2K') return 'Комфортный 2K и запас на апгрейд';
  if (tier === 'Full HD') return 'Full HD, киберспорт и учеба';
  return 'Под игры, работу и бюджет';
}

function getAdminProcessorBrand(cpu: string) {
  if (/ryzen|threadripper|\bamd\b/i.test(cpu)) return { badge: 'AMD', intro: 'AMD', brand: 'amd' as const };
  if (/intel|core|celeron|pentium|\bi[3579][-\s]?\d/i.test(cpu)) return { badge: 'intel', intro: 'Intel', brand: 'intel' as const };
  return { badge: 'CPU', intro: 'CPU', brand: 'cpu' as const };
}

function AdminProcessorBrandLogo({ brand, label }: { brand: 'amd' | 'intel' | 'cpu'; label: string }) {
  if (brand === 'intel') {
    return (
      <span className="productBrandBadge isIntel" aria-label="Intel">
        <img className="productBrandLogo productBrandLogo-intel" src={intelLogo} alt="" aria-hidden="true" />
      </span>
    );
  }

  if (brand === 'amd') {
    return (
      <span className="productBrandBadge isAmd" aria-label="AMD">
        <img className="productBrandLogo productBrandLogo-amd" src={amdLogo} alt="" aria-hidden="true" />
      </span>
    );
  }

  return <span className="productBrandBadge isNeutral">{label}</span>;
}

const adminSpecIcons: Record<string, string> = {
  GPU: '▣',
  CPU: '◈',
  RAM: '▤',
  SSD: '◎',
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="adminField">
      <span>{label}</span>
      {children}
    </label>
  );
}

function ProductForm({ draft, setDraft, upload, uploadMessage }: { draft: ProductDraft; setDraft: (value: ProductDraft) => void; upload: (file: File | null) => void; uploadMessage: string }) {
  return (
    <div className="productEditorForm">
      <div className="productFormSection">
        <h3>Карточка на витрине</h3>
        <div className="productFormGrid">
          <Field label="Название">
            <input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="Например: RTX 4070 / Ryzen 7" />
          </Field>
          <Field label="Цена, ₽">
            <input type="number" value={draft.price} onChange={(event) => setDraft({ ...draft, price: Number(event.target.value) })} placeholder="149900" />
          </Field>
          <Field label="Текст цены">
            <input value={draft.priceText} onChange={(event) => setDraft({ ...draft, priceText: event.target.value })} placeholder="Можно оставить пустым" />
          </Field>
          <Field label="Бейдж">
            <input value={draft.badge} onChange={(event) => setDraft({ ...draft, badge: event.target.value })} placeholder="В наличии" />
          </Field>
          <Field label="Статус">
            <select value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value })}>
              <option value="available">В наличии</option>
              <option value="preorder">Под заказ</option>
              <option value="hidden">Скрыт</option>
              <option value="archived">Архив</option>
            </select>
          </Field>
          <Field label="Класс товара">
            <select value={draft.productClass} onChange={(event) => setDraft({ ...draft, productClass: event.target.value })}>
              <option value="fullhd">Full HD</option>
              <option value="qhd">2K / QHD</option>
              <option value="top">Топ</option>
              <option value="work">Работа</option>
              <option value="custom">Custom</option>
            </select>
          </Field>
        </div>
      </div>

      <div className="productFormSection">
        <h3>Фото</h3>
        <div className="productUploadBox">
          <div>
            <img src={resolveCatalogProductImage(draft.imageUrl, Number(draft.price) || 0, `${draft.id || 'new-product'}:${draft.title}`)} alt="" />
          </div>
          <div>
            <Field label="URL фото">
              <input value={draft.imageUrl || ''} onChange={(event) => setDraft({ ...draft, imageUrl: event.target.value })} placeholder="/uploads/photo.webp или https://..." />
            </Field>
            <label className="productFileButton">
              <input type="file" accept="image/*" onChange={(event) => void upload(event.target.files?.[0] || null)} />
              Загрузить фото с компьютера
            </label>
            {uploadMessage && <p>{uploadMessage}</p>}
          </div>
        </div>
      </div>

      <div className="productFormSection">
        <h3>Комплектующие</h3>
        <div className="productFormGrid">
          <Field label="Процессор">
            <input value={draft.cpu} onChange={(event) => setDraft({ ...draft, cpu: event.target.value })} placeholder="Ryzen 5 7500F" />
          </Field>
          <Field label="Видеокарта">
            <input value={draft.gpu} onChange={(event) => setDraft({ ...draft, gpu: event.target.value })} placeholder="RTX 4070 Super" />
          </Field>
          <Field label="Оперативная память">
            <input value={draft.ram} onChange={(event) => setDraft({ ...draft, ram: event.target.value })} placeholder="32GB DDR5" />
          </Field>
          <Field label="Накопитель">
            <input value={draft.storage} onChange={(event) => setDraft({ ...draft, storage: event.target.value })} placeholder="1TB NVMe" />
          </Field>
          <Field label="Блок питания">
            <input value={draft.psu} onChange={(event) => setDraft({ ...draft, psu: event.target.value })} placeholder="750W Gold" />
          </Field>
          <Field label="Охлаждение">
            <input value={draft.cooling} onChange={(event) => setDraft({ ...draft, cooling: event.target.value })} placeholder="СЖО 240 мм" />
          </Field>
          <Field label="Корпус">
            <input value={draft.caseName} onChange={(event) => setDraft({ ...draft, caseName: event.target.value })} placeholder="Аквариум RGB" />
          </Field>
          <Field label="Сценарий">
            <input value={draft.scenario} onChange={(event) => setDraft({ ...draft, scenario: event.target.value })} placeholder="2K gaming, стриминг" />
          </Field>
        </div>
      </div>

      <div className="productFormSection">
        <h3>Описание и порядок</h3>
        <Field label="Короткое описание">
          <input value={draft.shortDescription} onChange={(event) => setDraft({ ...draft, shortDescription: event.target.value })} placeholder="Коротко для таблицы/админки" />
        </Field>
        <Field label="Характеристики списком">
          <textarea value={draft.specsText} onChange={(event) => setDraft({ ...draft, specsText: event.target.value })} placeholder="Каждая характеристика с новой строки" />
        </Field>
        <Field label="Полное описание">
          <textarea value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} placeholder="Описание для админки и будущей карточки товара" />
        </Field>
        <div className="productFormGrid isCompact">
          <Field label="Порядок">
            <input type="number" value={draft.sortOrder} onChange={(event) => setDraft({ ...draft, sortOrder: Number(event.target.value) })} placeholder="1000" />
          </Field>
          <p>Рекомендуемые товары и их порядок настраиваются во вкладке «Блоки сайта».</p>
        </div>
      </div>
    </div>
  );
}

function ProductSelect({ products, ids, max, onChange }: { products: AdminProduct[]; ids: string[]; max: number; onChange: (ids: string[]) => void }) {
  const selected = ids.map((id) => products.find((product) => product.id === id)).filter((product): product is AdminProduct => Boolean(product));
  return (
    <div className="productPicker">
      <select onChange={(event) => {
        const id = event.target.value;
        if (!id || ids.includes(id) || ids.length >= max) return;
        onChange([...ids, id]);
      }}>
        <option value="">Добавить товар</option>
        {products.map((product) => (
          <option key={product.id} value={product.id}>{product.title} · {product.priceText}</option>
        ))}
      </select>
      {selected.map((product, index) => (
        <div key={product.id}>
          <span>{index + 1}. {product.title}</span>
          <b>{product.priceText}</b>
          <button type="button" onClick={() => onChange(ids.filter((id) => id !== product.id))}>Убрать</button>
        </div>
      ))}
    </div>
  );
}

function AdminPanel({ title, note, children }: { title: string; note?: string; children?: React.ReactNode }) {
  return (
    <section className="adminPanel">
      <header>
        <h2>{title}</h2>
        {note && <p>{note}</p>}
      </header>
      {children}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="adminStat">
      <span>{label}</span>
      <strong>{typeof value === 'number' ? compactNumber(value) : value}</strong>
    </div>
  );
}

function Meter({ label, value, note }: { label: string; value: number; note: string }) {
  return (
    <div className="serverMeter">
      <div>
        <span>{label}</span>
        <b>{value}%</b>
      </div>
      <i>
        <span style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
      </i>
      <small>{note}</small>
    </div>
  );
}

function MetricsChart({ points }: { points: DashboardPayload['chart'] }) {
  const max = Math.max(1, ...points.flatMap((point) => [point.pageViews, point.clicks, point.requests]));
  return (
    <div className="metricsChart" aria-label="График активности сайта">
      {points.map((point) => (
        <div className="metricsDay" key={point.date}>
          <div className="metricsBars">
            <span className="views" style={{ height: `${Math.max(5, (point.pageViews / max) * 100)}%` }} title={`Переходы: ${point.pageViews}`} />
            <span className="clicks" style={{ height: `${Math.max(5, (point.clicks / max) * 100)}%` }} title={`Клики: ${point.clicks}`} />
            <span className="requests" style={{ height: `${Math.max(5, (point.requests / max) * 100)}%` }} title={`Заявки: ${point.requests}`} />
          </div>
          <small>{new Date(point.date).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })}</small>
        </div>
      ))}
    </div>
  );
}

function DataRows({ rows, empty = 'Данных пока нет' }: { rows: Array<Array<string | number>>; empty?: string }) {
  if (rows.length === 0) return <p className="adminEmpty">{empty}</p>;

  return (
    <div className="adminTable">
      {rows.map((row) => (
        <div key={row.join('-')}>
          {row.map((cell, index) => (index === 0 ? <span key={cell}>{cell}</span> : index === 1 ? <b key={cell}>{cell}</b> : <small key={cell}>{cell}</small>))}
        </div>
      ))}
    </div>
  );
}
