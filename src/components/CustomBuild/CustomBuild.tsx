import { useEffect, useMemo, useRef, useState } from 'react';
import { contacts } from '../../data/contacts';
import { useProducts } from '../../hooks/useProducts';
import { createCustomerRequest, fetchCustomComponents, trackEvent, type ComponentOption } from '../../lib/api';
import { getClosestProducts, getProductKey } from '../../lib/products';
import './CustomBuild.css';

const games = ['Cyberpunk 2077', 'Counter-Strike 2', 'Работа / 3D / AI'] as const;
const resolutions = ['1080p', '1440p', '4K'] as const;
const partConditions = ['Новые', 'Б/у выгоднее', 'Не важно'] as const;
const ramOptions = ['16GB', '32GB', '64GB'] as const;
const storageOptions = ['512GB', '1TB', '2TB'] as const;
const caseStyles = ['Минимализм', 'RGB', 'Airflow'] as const;

type Game = (typeof games)[number];
type Resolution = (typeof resolutions)[number];
type PartCondition = (typeof partConditions)[number];
type RamOption = (typeof ramOptions)[number];
type StorageOption = (typeof storageOptions)[number];
type CaseStyle = (typeof caseStyles)[number];

const included = [
  'Индивидуальный подбор комплектующих',
  'Идеальный кабель-менеджмент',
  'Windows 11 Pro и настройка драйверов',
  'Температурные стресс-тесты',
];

const componentLabels: Record<ComponentOption['category'], string> = {
  cpu: 'Процессор',
  gpu: 'Видеокарта',
  motherboard: 'Материнская плата',
  ram: 'Оперативная память',
  storage: 'Накопитель',
  psu: 'Блок питания',
  cooling: 'Охлаждение',
  case: 'Корпус',
  os: 'Система',
  service: 'Сервис',
};

const componentOrder: ComponentOption['category'][] = ['gpu', 'cpu', 'motherboard', 'ram', 'storage', 'psu', 'cooling', 'case', 'os', 'service'];

function formatPrice(value: number) {
  return new Intl.NumberFormat('ru-RU').format(value) + ' ₽';
}

function getContactError(value: string) {
  const contact = value.trim();
  if (!contact) return 'Укажи телефон, Telegram или VK, чтобы мы могли ответить.';
  if (contact.length < 3) return 'Контакт выглядит слишком коротким.';
  if (/^@[\w.]{3,}$/i.test(contact)) return '';
  if (/t\.me\/|vk\.com\/|vk\.me\/|telegram/i.test(contact)) return '';
  if (/^\+?[\d\s()-]{7,}$/.test(contact)) return '';
  if (/^[\w.+-]+@[\w.-]+\.[a-z]{2,}$/i.test(contact)) return '';
  return 'Напиши телефон, @telegram, ссылку VK или email.';
}

function getBuildClass(budget: number, resolution: Resolution) {
  if (budget >= 210000 || (resolution === '4K' && budget >= 160000)) return 'Флагманский ULTRA';
  if (budget >= 120000 || resolution === '1440p') return 'Сбалансированный PRO';
  return 'Стартовый START';
}

function getRecommendation(budget: number, game: Game, resolution: Resolution, ramChoice: RamOption, storageChoice: StorageOption) {
  const workMode = game === 'Работа / 3D / AI';
  const ultra = budget >= 210000 || (resolution === '4K' && budget >= 160000);
  const pro = budget >= 120000 || resolution === '1440p';

  const gpu = ultra
    ? 'Nvidia RTX 5080 16GB'
    : pro
      ? 'Nvidia RTX 4070 Super 12GB'
      : budget >= 80000
        ? 'Nvidia RTX 5060 8GB'
        : 'RTX 3060 Ti / RX 6700 XT';

  const cpu = ultra
    ? 'AMD Ryzen 7 7800X3D'
    : pro
      ? 'AMD Ryzen 5 7500F / 7600X'
      : 'Ryzen 5 5500 / Intel i5-12400F';

  const ram = workMode && ramChoice === '16GB' ? '32GB DDR5 Dual Channel' : `${ramChoice} DDR5 / DDR4`;
  const storage = `NVMe SSD ${storageChoice}`;
  const cooling = ultra ? 'СЖО 240–360mm ARGB' : pro ? 'СЖО 240mm / башня' : 'Тихое воздушное охлаждение';

  const baseFps = game === 'Counter-Strike 2' ? 430 : game === 'Cyberpunk 2077' ? 112 : 145;
  const budgetFactor = budget / 120000;
  const resolutionFactor = resolution === '1080p' ? 1.18 : resolution === '1440p' ? 1 : 0.62;
  const fps = Math.max(45, Math.round(baseFps * budgetFactor * resolutionFactor));

  return {
    buildClass: getBuildClass(budget, resolution),
    status: budget >= 90000 ? 'Оптимально' : 'Бюджетно',
    gpu,
    cpu,
    ram,
    storage,
    cooling,
    fps,
  };
}

export function CustomBuild() {
  const [budget, setBudget] = useState(120000);
  const [game, setGame] = useState<Game>('Counter-Strike 2');
  const [resolution, setResolution] = useState<Resolution>('1440p');
  const [partCondition, setPartCondition] = useState<PartCondition>('Не важно');
  const [ramChoice, setRamChoice] = useState<RamOption>('32GB');
  const [storageChoice, setStorageChoice] = useState<StorageOption>('1TB');
  const [caseStyle, setCaseStyle] = useState<CaseStyle>('RGB');
  const [copied, setCopied] = useState(false);
  const [contact, setContact] = useState('');
  const [requestState, setRequestState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [customOpen, setCustomOpen] = useState(false);
  const [componentOptions, setComponentOptions] = useState<ComponentOption[]>([]);
  const [selectedComponents, setSelectedComponents] = useState<Partial<Record<ComponentOption['category'], string>>>({});
  const [customContact, setCustomContact] = useState('');
  const [customRequestState, setCustomRequestState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const { products } = useProducts();
  const customPartsModalRef = useRef<HTMLDivElement | null>(null);
  const lastFocusedElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    let alive = true;
    fetchCustomComponents()
      .then((items) => {
        if (alive) setComponentOptions(items);
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);

  const openCustomParts = () => {
    lastFocusedElementRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setCustomOpen(true);
  };

  const closeCustomParts = () => {
    setCustomOpen(false);
    window.setTimeout(() => lastFocusedElementRef.current?.focus(), 0);
  };

  useEffect(() => {
    const open = () => openCustomParts();
    window.addEventListener('togoshol:open-custom-parts', open);
    return () => window.removeEventListener('togoshol:open-custom-parts', open);
  }, []);

  useEffect(() => {
    if (!customOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeCustomParts();
      if (event.key !== 'Tab') return;

      const focusable = customPartsModalRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable || focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', closeOnEscape);
    window.setTimeout(() => customPartsModalRef.current?.querySelector<HTMLElement>('button, select, input')?.focus(), 0);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [customOpen]);

  const recommendation = useMemo(
    () => getRecommendation(budget, game, resolution, ramChoice, storageChoice),
    [budget, game, ramChoice, resolution, storageChoice],
  );
  const closestProducts = useMemo(() => getClosestProducts(products, budget, 3), [budget, products]);
  const hasBudgetWarning = resolution === '4K' && budget < 160000;
  const componentsByCategory = useMemo(() => {
    return componentOrder.reduce(
      (acc, category) => {
        acc[category] = componentOptions.filter((item) => item.category === category);
        return acc;
      },
      {} as Record<ComponentOption['category'], ComponentOption[]>,
    );
  }, [componentOptions]);
  const selectedList = useMemo(() => {
    return componentOrder
      .map((category) => componentOptions.find((item) => item.id === selectedComponents[category]))
      .filter((item): item is ComponentOption => Boolean(item));
  }, [componentOptions, selectedComponents]);
  const customTotal = selectedList.reduce((sum, item) => sum + item.price, 0);
  const customWattage = selectedList.reduce((sum, item) => sum + item.wattage, 0);
  const missingCore = componentOrder.filter((category) => !['os', 'service'].includes(category) && !selectedComponents[category]);

  const messageText = `Здравствуйте! Хочу обсудить сборку TOGOSHOL.
Бюджет: ${formatPrice(budget)}
Игра/задача: ${game}
Разрешение: ${resolution}
Комплектующие: ${partCondition}
RAM: ${ramChoice}
SSD: ${storageChoice}
Стиль корпуса: ${caseStyle}
Рекомендация сайта: ${recommendation.buildClass}, ${recommendation.cpu}, ${recommendation.gpu}, ${recommendation.ram}, ${recommendation.storage}.`;

  const copyMessage = async () => {
    await navigator.clipboard.writeText(messageText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const submitRequest = async () => {
    if (getContactError(contact)) {
      setRequestState('error');
      return;
    }

    setRequestState('sending');
    try {
      const result = await createCustomerRequest({
        source: 'configurator',
        contact,
        contactType: contact.includes('@') ? 'messenger' : 'phone',
        message: messageText,
        budget,
        game,
        resolution,
        partsCondition: partCondition,
        ram: ramChoice,
        storage: storageChoice,
        pagePath: window.location.pathname + window.location.hash,
      });
      trackEvent('configurator_submit', { requestId: result.requestId, budget, game, resolution });
      setRequestState('sent');
    } catch {
      setRequestState('error');
    }
  };

  const submitCustomRequest = async () => {
    if (getContactError(customContact) || selectedList.length === 0) {
      setCustomRequestState('error');
      return;
    }

    const summary = selectedList.map((item) => `${componentLabels[item.category]}: ${item.title}`).join('\n');
    setCustomRequestState('sending');
    try {
      const result = await createCustomerRequest({
        source: 'configurator',
        contact: customContact,
        contactType: customContact.includes('@') ? 'messenger' : 'phone',
        budget: customTotal,
        message: `Хочу сборку из доступных комплектующих:\n${summary}\n\nОценка: ${formatPrice(customTotal)}. Потребление выбранных активных компонентов: ~${customWattage}W.`,
        pagePath: window.location.pathname + window.location.hash,
      });
      trackEvent('configurator_submit', { requestId: result.requestId, customTotal, selectedCount: selectedList.length });
      setCustomRequestState('sent');
    } catch {
      setCustomRequestState('error');
    }
  };

  return (
    <section id="custom" className="section customBuild">
      <div className="container">
        <div className="configurator" data-reveal>
          <div className="configuratorCopy">
            <span className="badge">Индивидуальный калькулятор</span>
            <h2>
              Соберём ПК под <span>твою задачу</span>
            </h2>
            <p>
              Укажи ориентировочный бюджет и ключевые требования. Мы моментально рассчитаем класс сборки и подготовим
              основу для разговора с инженером.
            </p>

            <div className="configControls" aria-label="Настройки конфигуратора">
              <label className="budgetControl">
                <span>
                  <b>Комфортный бюджет:</b>
                  <strong>{formatPrice(budget)}</strong>
                </span>
                <input
                  className="budgetNumber"
                  type="number"
                  min="50000"
                  max="300000"
                  step="5000"
                  value={budget}
                  onChange={(event) => setBudget(Math.min(300000, Math.max(50000, Number(event.target.value) || 50000)))}
                  aria-label="Ввести бюджет вручную"
                />
                <input
                  type="range"
                  min="50000"
                  max="300000"
                  step="5000"
                  value={budget}
                  onChange={(event) => setBudget(Number(event.target.value))}
                  aria-label="Комфортный бюджет"
                />
                <i>
                  <small>50 000 ₽</small>
                  <small>150 000 ₽</small>
                  <small>300 000 ₽</small>
                </i>
              </label>

              <div className="controlGroup">
                <span>Любимая игра для теста:</span>
                <div className="segmented" role="radiogroup" aria-label="Игра или задача">
                  {games.map((item) => (
                    <button
                      className={game === item ? 'isActive' : ''}
                      key={item}
                      type="button"
                      role="radio"
                      aria-checked={game === item}
                      onClick={() => setGame(item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="controlGroup">
                <span>Разрешение монитора:</span>
                <div className="segmented" role="radiogroup" aria-label="Разрешение монитора">
                  {resolutions.map((item) => (
                    <button
                      className={resolution === item ? 'isActive' : ''}
                      key={item}
                      type="button"
                      role="radio"
                      aria-checked={resolution === item}
                      onClick={() => setResolution(item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="controlGroup">
                <span>Комплектующие:</span>
                <div className="segmented" role="radiogroup" aria-label="Тип комплектующих">
                  {partConditions.map((item) => (
                    <button
                      className={partCondition === item ? 'isActive' : ''}
                      key={item}
                      type="button"
                      role="radio"
                      aria-checked={partCondition === item}
                      onClick={() => setPartCondition(item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="controlGroup">
                <span>Память и накопитель:</span>
                <div className="segmented segmentedCompact" role="radiogroup" aria-label="Оперативная память">
                  {ramOptions.map((item) => (
                    <button className={ramChoice === item ? 'isActive' : ''} key={item} type="button" role="radio" aria-checked={ramChoice === item} onClick={() => setRamChoice(item)}>
                      {item}
                    </button>
                  ))}
                </div>
                <div className="segmented segmentedCompact" role="radiogroup" aria-label="Накопитель">
                  {storageOptions.map((item) => (
                    <button className={storageChoice === item ? 'isActive' : ''} key={item} type="button" role="radio" aria-checked={storageChoice === item} onClick={() => setStorageChoice(item)}>
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="controlGroup">
                <span>Стиль корпуса:</span>
                <div className="segmented" role="radiogroup" aria-label="Стиль корпуса">
                  {caseStyles.map((item) => (
                    <button
                      className={caseStyle === item ? 'isActive' : ''}
                      key={item}
                      type="button"
                      role="radio"
                      aria-checked={caseStyle === item}
                      onClick={() => setCaseStyle(item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {hasBudgetWarning && (
              <p className="configWarning">
                Для комфортного 4K обычно нужен бюджет выше 160 000 ₽. В текущем бюджете лучше рассмотреть 1440p или
                сборку под заказ с акцентом на видеокарту.
              </p>
            )}

            <ul className="configIncluded">
              {included.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            <div className="configActions">
              <a className="button buttonPrimary configButton" href={contacts.vk} target="_blank" rel="noreferrer" onClick={() => trackEvent('contact_click_vk', { placement: 'configurator' })}>
                Обсудить эту сборку с инженером
              </a>
              <button id="custom-parts" className="button buttonSecondary configCopyButton" type="button" onClick={openCustomParts}>
                Собрать из комплектующих
              </button>
              <button className="button buttonSecondary configCopyButton" type="button" onClick={copyMessage}>
                {copied ? 'Скопировано' : 'Скопировать конфигурацию'}
              </button>
            </div>
            <div className="configLeadForm" aria-label="Оставить заявку">
              <label className="configContactField">
                <span>Контакт для ответа</span>
                <input
                  type="text"
                  value={contact}
                  onChange={(event) => {
                    setContact(event.target.value);
                    if (requestState === 'error') setRequestState('idle');
                  }}
                  placeholder="Телефон, @telegram или VK"
                  aria-invalid={requestState === 'error'}
                />
              </label>
              <button className="button buttonPrimary" type="button" onClick={submitRequest} disabled={requestState === 'sending'}>
                {requestState === 'sending' ? 'Отправляем' : requestState === 'sent' ? 'Заявка отправлена' : 'Оставить заявку'}
              </button>
            </div>
            {requestState === 'error' && <p className="configWarning">{getContactError(contact)}</p>}
            {requestState === 'sent' && <p className="configSuccess">Заявка ушла. Ответим по указанному контакту и уточним наличие комплектующих.</p>}
            <p className="configNote">
              Расчёт ориентировочный. Итоговую конфигурацию уточним по наличию, ценам комплектующих и состоянию деталей.
            </p>
          </div>

          <aside className="recommendationCard" aria-live="polite" key={`${budget}-${game}-${resolution}-${ramChoice}-${storageChoice}`}>
            <div className="recommendationHeader">
              <span>Рекомендуемый класс</span>
              <b>{recommendation.status}</b>
            </div>
            <h3>{recommendation.buildClass}</h3>

            <dl className="specTable">
              <div>
                <dt>Видеокарта:</dt>
                <dd>{recommendation.gpu}</dd>
              </div>
              <div>
                <dt>Процессор:</dt>
                <dd>{recommendation.cpu}</dd>
              </div>
              <div>
                <dt>Оперативная память:</dt>
                <dd>{recommendation.ram}</dd>
              </div>
              <div>
                <dt>Накопитель:</dt>
                <dd>{recommendation.storage}</dd>
              </div>
              <div>
                <dt>Охлаждение:</dt>
                <dd>{recommendation.cooling}</dd>
              </div>
            </dl>

            <div className="fpsBox">
              <span>
                Оценка FPS в {game}
                <small>{resolution}</small>
              </span>
              <strong>~{recommendation.fps}</strong>
              <small>кадров/сек</small>
            </div>

            <div className="closestProducts">
              <span>Ближайшие готовые сборки</span>
              {closestProducts.map((product) => (
                <a key={getProductKey(product)} href={contacts.vk} target="_blank" rel="noreferrer" onClick={() => trackEvent('product_cta_click', { productId: product.sourceId, placement: 'closest_products' })}>
                  <b>{product.normalizedTitle}</b>
                  <small>{product.price}</small>
                </a>
              ))}
            </div>
          </aside>
        </div>
      </div>

      {customOpen && (
        <div
          className="customPartsOverlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="custom-parts-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeCustomParts();
          }}
        >
          <div className="customPartsModal" ref={customPartsModalRef}>
            <header className="customPartsHeader">
              <div>
                <span className="badge">Под заказ</span>
                <h3 id="custom-parts-title">Собери ПК из доступных комплектующих</h3>
                <p>Выбирай только то, что нужно. Ничего не предвыбрано: итог появится после твоего выбора.</p>
              </div>
              <button type="button" onClick={closeCustomParts} aria-label="Закрыть">×</button>
            </header>

            <div className="customPartsLayout">
              <div className="partsSelectorList">
                {componentOrder.map((category) => {
                  const options = componentsByCategory[category] || [];
                  if (options.length === 0) return null;
                  const selectedOption = options.find((option) => option.id === selectedComponents[category]);

                  return (
                    <label className={selectedOption ? 'partSelectRow isSelected' : 'partSelectRow'} key={category}>
                      <div className="partSelectLabel">
                        <strong>{componentLabels[category]}</strong>
                        <span>{selectedOption ? selectedOption.title : 'Не выбрано'}</span>
                      </div>
                      <div className="partSelectControl">
                        <select
                          value={selectedComponents[category] || ''}
                          onChange={(event) =>
                            setSelectedComponents((current) => ({
                              ...current,
                              [category]: event.target.value || undefined,
                            }))
                          }
                        >
                          <option value="">Выбрать</option>
                          {options.map((option) => (
                            <option key={option.id} value={option.id}>
                              {option.title} · {option.price > 0 ? formatPrice(option.price) : 'включено'}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          disabled={!selectedOption}
                          onClick={() =>
                            setSelectedComponents((current) => ({
                              ...current,
                              [category]: undefined,
                            }))
                          }
                        >
                          Сброс
                        </button>
                      </div>
                      <p>
                        {selectedOption
                          ? `${selectedOption.subtitle || selectedOption.description || 'Доступно для сборки'}${selectedOption.tags.length > 0 ? ` · ${selectedOption.tags.slice(0, 3).join(' · ')}` : ''}`
                          : `Выбери ${componentLabels[category].toLowerCase()} из доступных вариантов`}
                      </p>
                      {selectedOption && (
                        <div className="partSelectMeta">
                          <span>{selectedOption.price > 0 ? formatPrice(selectedOption.price) : 'включено'}</span>
                          {selectedOption.wattage > 0 && <span>~{selectedOption.wattage}W</span>}
                        </div>
                      )}
                    </label>
                  );
                })}
              </div>

              <aside className="customPartsSummary">
                <span>Итог сборки</span>
                {selectedList.length === 0 ? (
                  <p className="emptySelection">Ты еще ничего не выбрал. Начни с видеокарты или процессора.</p>
                ) : (
                  <ul>
                    {selectedList.map((item) => (
                      <li key={item.id}>
                        <small>{componentLabels[item.category]}</small>
                        <b>{item.title}</b>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="summaryNumbers">
                  <div>
                    <small>Оценка</small>
                    <strong>{customTotal > 0 ? formatPrice(customTotal) : 'по выбору'}</strong>
                  </div>
                  <div>
                    <small>Питание</small>
                    <strong>{customWattage > 0 ? `~${customWattage}W` : 'нет данных'}</strong>
                  </div>
                </div>
                {missingCore.length > 0 && selectedList.length > 0 && (
                  <p className="partsHint">Не хватает: {missingCore.map((category) => componentLabels[category]).join(', ')}.</p>
                )}
                <label className="customContactField">
                  <span>Контакт для ответа</span>
                  <input
                    value={customContact}
                    onChange={(event) => {
                      setCustomContact(event.target.value);
                      if (customRequestState === 'error') setCustomRequestState('idle');
                    }}
                    placeholder="Телефон, @telegram или VK"
                    aria-invalid={customRequestState === 'error'}
                  />
                </label>
                <button className="button buttonPrimary" type="button" onClick={submitCustomRequest} disabled={customRequestState === 'sending'}>
                  {customRequestState === 'sending' ? 'Отправляем' : customRequestState === 'sent' ? 'Заявка отправлена' : 'Отправить сборку'}
                </button>
                {customRequestState === 'error' && <p className="partsHint isError">{selectedList.length === 0 ? 'Выбери хотя бы одну деталь.' : getContactError(customContact)}</p>}
                {customRequestState === 'sent' && <p className="partsHint isSuccess">Сборка отправлена. Мы проверим совместимость и ответим по контакту.</p>}
              </aside>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
