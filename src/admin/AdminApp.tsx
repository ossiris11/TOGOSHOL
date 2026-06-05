import { useEffect, useMemo, useState } from 'react';
import './AdminApp.css';

type AdminTab = 'dashboard' | 'blocks' | 'products' | 'components' | 'requests' | 'reviews' | 'settings';

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
  rating: number;
  text: string;
  source: string;
  externalUrl?: string | null;
  imageUrl?: string | null;
  isPinned: boolean;
  sortOrder: number;
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

type DashboardPayload = {
  stats: Record<string, number>;
  recentRequests: Array<{ id: string; status: string; source: string; contact: string; budget?: number | null; productTitle: string; createdAt: string }>;
  topProducts: Array<{ productId: string | null; title: string; count: number }>;
  contacts: Array<{ type: string; count: number }>;
};

type ProductDraft = Omit<AdminProduct, 'id' | 'specs' | 'deletedAt'> & { id?: string; specsText: string };

const tabs: Array<{ id: AdminTab; label: string }> = [
  { id: 'dashboard', label: 'Дашборд' },
  { id: 'blocks', label: 'Блоки сайта' },
  { id: 'products', label: 'Товары' },
  { id: 'components', label: 'Комплектующие' },
  { id: 'requests', label: 'Заявки' },
  { id: 'reviews', label: 'Отзывы' },
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

async function adminApi<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    credentials: 'include',
    headers: options?.body instanceof FormData ? undefined : { 'Content-Type': 'application/json', ...(options?.headers || {}) },
    ...options,
  });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return response.json() as Promise<T>;
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
    specsText: undefined,
    id: undefined,
  };
}

function rub(value?: number | null) {
  if (!value) return 'без бюджета';
  return new Intl.NumberFormat('ru-RU').format(value) + ' ₽';
}

export function AdminApp() {
  const [authChecked, setAuthChecked] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  useEffect(() => {
    adminApi('/api/admin/me')
      .then(() => setAuthenticated(true))
      .catch(() => setAuthenticated(false))
      .finally(() => setAuthChecked(true));
  }, []);

  const login = async () => {
    setLoginError('');
    try {
      await adminApi('/api/admin/login', { method: 'POST', body: JSON.stringify({ password }) });
      setAuthenticated(true);
    } catch {
      setLoginError('Пароль не подошел');
    }
  };

  const logout = async () => {
    await adminApi('/api/admin/logout', { method: 'POST' }).catch(() => undefined);
    setAuthenticated(false);
  };

  if (!authChecked) return <div className="adminBoot">Проверяем сессию...</div>;

  if (!authenticated) {
    return (
      <main className="adminLogin">
        <section className="adminLoginPanel">
          <span>TOGOSHOL Admin</span>
          <h1>Вход в панель</h1>
          <p>На лендинге вход не показывается. Доступ только по прямому адресу.</p>
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
        {activeTab === 'settings' && <SettingsPage />}
      </section>
    </main>
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

  useEffect(() => {
    adminApi<{ ok: boolean } & DashboardPayload>('/api/admin/dashboard').then(setData).catch(() => undefined);
  }, []);

  if (!data) return <AdminPanel title="Данные загружаются" />;

  return (
    <div className="adminStack">
      <div className="adminStats">
        <Stat label="Событий сегодня" value={data.stats.eventsToday} />
        <Stat label="Событий за 7 дней" value={data.stats.events7d} />
        <Stat label="Новые заявки" value={data.stats.requestsNew} />
        <Stat label="Товары активны" value={data.stats.productsActive} />
        <Stat label="Отзывы ждут" value={data.stats.reviewsPending} />
      </div>
      <AdminPanel title="Последние заявки">
        <DataRows rows={data.recentRequests.map((item) => [item.contact, item.productTitle || item.source, rub(item.budget), new Date(item.createdAt).toLocaleString('ru-RU')])} />
      </AdminPanel>
      <AdminPanel title="Топ товаров по активности">
        <DataRows rows={data.topProducts.map((item) => [item.title, `${item.count} событий`])} />
      </AdminPanel>
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
  const [draft, setDraft] = useState<ProductDraft>(emptyProduct);
  const [message, setMessage] = useState('');

  const load = () => adminApi<{ items: AdminProduct[] }>('/api/admin/products').then((payload) => setProducts(payload.items));
  useEffect(() => void load(), []);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return products.filter((product) => !needle || [product.title, product.gpu, product.cpu, product.priceText].join(' ').toLowerCase().includes(needle));
  }, [products, query]);

  const save = async () => {
    const method = draft.id ? 'PATCH' : 'POST';
    const url = draft.id ? `/api/admin/products/${draft.id}` : '/api/admin/products';
    await adminApi(url, { method, body: JSON.stringify(draftToPayload(draft)) });
    setMessage('Сохранено');
    setDraft(emptyProduct);
    await load();
  };

  const remove = async (id: string) => {
    await adminApi(`/api/admin/products/${id}`, { method: 'DELETE' });
    await load();
  };

  const upload = async (file: File | null) => {
    if (!file) return;
    const form = new FormData();
    form.set('file', file);
    const result = await adminApi<{ url: string }>('/api/admin/uploads/images', { method: 'POST', body: form });
    setDraft((current) => ({ ...current, imageUrl: result.url }));
  };

  return (
    <div className="adminGrid">
      <AdminPanel title="Каталог">
        <input className="adminInput" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Поиск по CPU, GPU, цене" />
        <div className="adminTable">
          {filtered.map((product) => (
            <div className={product.deletedAt ? 'isMuted' : ''} key={product.id}>
              <span>{product.title}</span>
              <b>{product.priceText}</b>
              <small>{product.status}</small>
              <button type="button" onClick={() => setDraft(productToDraft(product))}>Редактировать</button>
              <button type="button" onClick={() => void remove(product.id)}>Архив</button>
            </div>
          ))}
        </div>
      </AdminPanel>

      <AdminPanel title={draft.id ? 'Редактировать товар' : 'Новый товар'} note={message}>
        <ProductForm draft={draft} setDraft={setDraft} upload={upload} />
        <div className="adminActions">
          <button className="adminPrimary" type="button" onClick={save}>Сохранить товар</button>
          <button type="button" onClick={() => setDraft(emptyProduct)}>Очистить</button>
        </div>
      </AdminPanel>
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
  const [draft, setDraft] = useState({ authorName: '', rating: 5, text: '', source: 'avito', externalUrl: '', imageUrl: '', status: 'pending', isPinned: false, sortOrder: 1000 });
  const load = () => adminApi<{ items: AdminReview[] }>('/api/admin/reviews').then((payload) => setReviews(payload.items));
  useEffect(() => void load(), []);

  const save = async () => {
    await adminApi('/api/admin/reviews/import', { method: 'POST', body: JSON.stringify(draft) });
    setDraft({ authorName: '', rating: 5, text: '', source: 'avito', externalUrl: '', imageUrl: '', status: 'pending', isPinned: false, sortOrder: 1000 });
    await load();
  };

  const patch = async (id: string, status: string) => {
    await adminApi(`/api/admin/reviews/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
    await load();
  };

  return (
    <div className="adminGrid">
      <AdminPanel title="Импорт / ручной отзыв" note="Avito лучше добавлять ссылкой и скриншотом, если автоматический импорт недоступен или запрещен правилами площадки.">
        <div className="adminForm">
          <input value={draft.authorName} onChange={(event) => setDraft({ ...draft, authorName: event.target.value })} placeholder="Имя автора" />
          <select value={draft.source} onChange={(event) => setDraft({ ...draft, source: event.target.value })}>
            <option value="avito">Avito</option>
            <option value="vk">VK</option>
            <option value="telegram">Telegram</option>
            <option value="screenshot">Скриншот</option>
            <option value="manual">Вручную</option>
          </select>
          <input value={draft.externalUrl} onChange={(event) => setDraft({ ...draft, externalUrl: event.target.value })} placeholder="Ссылка на источник" />
          <input value={draft.imageUrl} onChange={(event) => setDraft({ ...draft, imageUrl: event.target.value })} placeholder="URL скриншота" />
          <textarea value={draft.text} onChange={(event) => setDraft({ ...draft, text: event.target.value })} placeholder="Текст отзыва" />
          <button className="adminPrimary" type="button" onClick={save}>Добавить на модерацию</button>
        </div>
      </AdminPanel>
      <AdminPanel title="Модерация">
        <div className="adminTable adminTableWide">
          {reviews.map((review) => (
            <div key={review.id}>
              <span>{review.authorName}</span>
              <b>{review.source} · {review.rating}/5</b>
              <small>{review.status}</small>
              <button type="button" onClick={() => void patch(review.id, 'published')}>Опубликовать</button>
              <button type="button" onClick={() => void patch(review.id, 'hidden')}>Скрыть</button>
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
      <AdminPanel title="Пароль админки" note={message || 'Пароль хранится в базе как hash. Сейчас выставлен 1234.'}>
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

function ProductForm({ draft, setDraft, upload }: { draft: ProductDraft; setDraft: (value: ProductDraft) => void; upload: (file: File | null) => void }) {
  return (
    <div className="adminForm">
      <input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="Название" />
      <div className="adminSplit">
        <select value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value })}>
          <option value="available">В наличии</option>
          <option value="preorder">Под заказ</option>
          <option value="hidden">Скрыт</option>
          <option value="archived">Архив</option>
        </select>
        <input type="number" value={draft.price} onChange={(event) => setDraft({ ...draft, price: Number(event.target.value) })} placeholder="Цена" />
      </div>
      <input value={draft.imageUrl || ''} onChange={(event) => setDraft({ ...draft, imageUrl: event.target.value })} placeholder="Фото URL" />
      <input type="file" accept="image/*" onChange={(event) => void upload(event.target.files?.[0] || null)} />
      <div className="adminSplit">
        <input value={draft.cpu} onChange={(event) => setDraft({ ...draft, cpu: event.target.value })} placeholder="CPU" />
        <input value={draft.gpu} onChange={(event) => setDraft({ ...draft, gpu: event.target.value })} placeholder="GPU" />
      </div>
      <div className="adminSplit">
        <input value={draft.ram} onChange={(event) => setDraft({ ...draft, ram: event.target.value })} placeholder="RAM" />
        <input value={draft.storage} onChange={(event) => setDraft({ ...draft, storage: event.target.value })} placeholder="SSD" />
      </div>
      <div className="adminSplit">
        <input value={draft.psu} onChange={(event) => setDraft({ ...draft, psu: event.target.value })} placeholder="БП" />
        <input value={draft.cooling} onChange={(event) => setDraft({ ...draft, cooling: event.target.value })} placeholder="Охлаждение" />
      </div>
      <textarea value={draft.specsText} onChange={(event) => setDraft({ ...draft, specsText: event.target.value })} placeholder="Характеристики, каждая с новой строки" />
      <textarea value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} placeholder="Описание" />
      <label className="adminCheckbox">
        <input type="checkbox" checked={draft.isFeatured} onChange={(event) => setDraft({ ...draft, isFeatured: event.target.checked })} />
        Рекомендуемый товар
      </label>
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

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="adminStat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function DataRows({ rows }: { rows: Array<Array<string | number>> }) {
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
