import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { useHeroParallax } from '../../hooks/useHeroParallax';
import { contacts } from '../../data/contacts';
import { trackEvent } from '../../lib/api';
import heroPc from '../../assets/hero-pc-main-cutout.png';
import './Hero.css';

const customSpecs = [
  { label: 'Видеокарта', value: 'RTX / Radeon под бюджет' },
  { label: 'Процессор', value: 'Ryzen 5-9 / Intel i5-i9' },
  { label: 'Память', value: '32-64GB DDR4 / DDR5' },
  { label: 'Охлаждение', value: 'Airflow / СЖО 240-360mm' },
];

function buildCustomRequestText(budget: string, look: string, hardware: string, delivery: string, wifi: string) {
  return `Здравствуйте! Хочу собрать ПК под заказ.
Бюджет: ${budget || 'не указал'}
Внешний вид: ${look || 'не указал'}
Пожелания по железу: ${hardware || 'не указал'}
Доставка: ${delivery}
Wi-Fi/Bluetooth: ${wifi}

Подберите, пожалуйста, оптимальную конфигурацию.`;
}

export function Hero() {
  const visualRef = useHeroParallax<HTMLDivElement>();
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [budget, setBudget] = useState('');
  const [look, setLook] = useState('');
  const [hardware, setHardware] = useState('');
  const [delivery, setDelivery] = useState<'Самовывоз' | 'СДЭК'>('Самовывоз');
  const [wifi, setWifi] = useState<'Нужен' | 'Нет'>('Нет');
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle');
  const modalRef = useRef<HTMLDivElement | null>(null);
  const requestText = useMemo(() => buildCustomRequestText(budget, look, hardware, delivery, wifi), [budget, delivery, hardware, look, wifi]);

  const closeCustomModal = () => setIsCustomModalOpen(false);
  const openCustomModal = () => {
    setIsCustomModalOpen(true);
    setCopyState('idle');
    trackEvent('custom_pc_modal_open', { placement: 'hero_custom_block' });
  };
  const copyRequest = async () => {
    try {
      await navigator.clipboard.writeText(requestText);
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1600);
    } catch {
      setCopyState('idle');
    }
  };

  useEffect(() => {
    if (!isCustomModalOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeCustomModal();
      if (event.key !== 'Tab') return;

      const focusable = modalRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input, textarea, [tabindex]:not([tabindex="-1"])');
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
    window.addEventListener('keydown', handleKeyDown);
    window.setTimeout(() => modalRef.current?.querySelector<HTMLElement>('input, button')?.focus(), 0);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isCustomModalOpen]);

  return (
    <section id="top" className="hero">
      <div className="heroBg" aria-hidden="true" />
      <div className="heroInner container">
        <div className="heroContent">
          <span className="badge heroBadge">Готовые и кастомные игровые ПК</span>
          <h1 className="heroTitle">
            <span>Игровые ПК</span>
            <span>в <b>Великом</b></span>
            <span><b>Новгороде</b></span>
          </h1>
          <p className="heroSubtitle">
            Собираем мощные компьютеры под игры, стриминг и работу. Подберём комплектующие, протестируем систему и
            поможем с подключением. Локальная поддержка под ключ.
          </p>
          <div className="heroActions">
            <a className="button buttonPrimary" href="#custom">
              Подобрать ПК
            </a>
              <a
                className="button buttonSecondary"
                href="#catalog"
                onClick={() => trackEvent('page_view', { section: 'catalog_from_hero' })}
              >
              Смотреть сборки
            </a>
          </div>
          <div className="heroStats" aria-label="Преимущества TOGOSHOL">
            <div>
              <strong>5-20</strong>
              <span>ПК в наличии и под заказ</span>
            </div>
            <div>
              <strong>100%</strong>
              <span>стресс-тест перед выдачей</span>
            </div>
            <div>
              <strong>Локально</strong>
              <span>новгородская поддержка</span>
            </div>
          </div>
        </div>

        <div className="heroVisual" ref={visualRef}>
          <div className="heroVisualInner">
            <div className="heroPcPhotoFrame">
              <img src={heroPc} alt="Мощный игровой ПК TOGOSHOL с RGB-подсветкой" />
              <span className="heroPcPhotoGlow" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>

      <div className="customPcBand" aria-labelledby="custom-pc-title">
        <div className="container customPcLayout">
          <article className="customPcCard">
            <div className="customPcImage">
              <img src={heroPc} alt="Кастомный игровой ПК TOGOSHOL" />
            </div>
            <div className="customPcCopy">
              <span className="customPcEyebrow">Custom PC</span>
              <h2 id="custom-pc-title">Собери свой <b>ПК</b></h2>
              <p>Любой бюджет, стиль корпуса и комплектующие под твои игры, работу и монитор.</p>
              <button type="button" className="customPcButton" onClick={openCustomModal}>
                Собрать ПК <span>→</span>
              </button>
            </div>
            <div className="customPcSpecs" aria-label="Примеры характеристик">
              {customSpecs.map((spec, index) => (
                <div className="customSpecRow" style={{ '--delay': `${index * 120}ms` } as CSSProperties} key={spec.label}>
                  <span>{spec.label}</span>
                  <strong>{spec.value}</strong>
                  <i aria-hidden="true" />
                </div>
              ))}
            </div>
          </article>

          <aside className="customPcContacts">
            <h3>Не разбираешься в комплектующих?</h3>
            <p>Напиши нам, подберём лучшее решение под цели и бюджет.</p>
            <a href={contacts.vk} target="_blank" rel="noreferrer" onClick={() => trackEvent('contact_click_vk', { placement: 'hero_custom_block' })}>
              VK <span>→</span>
            </a>
            <a href={contacts.avito} target="_blank" rel="noreferrer" onClick={() => trackEvent('contact_click_avito', { placement: 'hero_custom_block' })}>
              Avito <span>→</span>
            </a>
            <a href={contacts.instagram} target="_blank" rel="noreferrer" onClick={() => trackEvent('contact_click_instagram', { placement: 'hero_custom_block' })}>
              Instagram <span>→</span>
            </a>
          </aside>
        </div>
      </div>

      {isCustomModalOpen && (
        <div className="customOrderOverlay" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && closeCustomModal()}>
          <div className="customOrderModal" role="dialog" aria-modal="true" aria-labelledby="custom-order-title" ref={modalRef}>
            <button type="button" className="customOrderClose" aria-label="Закрыть" onClick={closeCustomModal}>×</button>
            <h2 id="custom-order-title">Сборка на заказ</h2>
            <p>Заполните пожелания, и мы подберём идеальное решение.</p>

            <div className="customOrderGrid">
              <label>
                <span>Бюджет сборки</span>
                <input value={budget} onChange={(event) => setBudget(event.target.value)} placeholder="Например: 150 000 ₽" />
              </label>
              <label>
                <span>Внешний вид</span>
                <input value={look} onChange={(event) => setLook(event.target.value)} placeholder="Белый аквариум, RGB..." />
              </label>
              <label className="isWide">
                <span>Пожелания по железу</span>
                <textarea value={hardware} onChange={(event) => setHardware(event.target.value)} placeholder="Например: обязательно RTX 4070, нужно 32GB ОЗУ..." />
              </label>
            </div>

            <div className="customOrderToggles">
              <fieldset>
                <legend>Способ доставки</legend>
                <div>
                  {(['Самовывоз', 'СДЭК'] as const).map((item) => (
                    <button className={delivery === item ? 'isActive' : ''} key={item} type="button" onClick={() => setDelivery(item)}>{item}</button>
                  ))}
                </div>
              </fieldset>
              <fieldset>
                <legend>Нужен Wi-Fi и Bluetooth?</legend>
                <div>
                  {(['Нужен', 'Нет'] as const).map((item) => (
                    <button className={wifi === item ? 'isActive' : ''} key={item} type="button" onClick={() => setWifi(item)}>{item}</button>
                  ))}
                </div>
              </fieldset>
            </div>

            <div className="customOrderAddress">
              <span>⌖</span>
              <p>Самовывоз из магазина <b>Санкт-Петербург, Московский проспект, д. 22М</b></p>
            </div>

            <div className="customOrderHint">Сначала скопируйте заявку, затем отправьте её нам в любой мессенджер.</div>

            <div className="customOrderActions">
              <button type="button" className="customOrderCopy" onClick={copyRequest}>{copyState === 'copied' ? 'Скопировано' : 'Скопировать'} <span>⧉</span></button>
              <a href={contacts.avito} target="_blank" rel="noreferrer" onClick={() => trackEvent('contact_click_avito', { placement: 'custom_order_modal' })}>Avito <span>→</span></a>
              <a href={`${contacts.vk}?message=${encodeURIComponent(requestText)}`} target="_blank" rel="noreferrer" onClick={() => trackEvent('contact_click_vk', { placement: 'custom_order_modal' })}>VK <span>→</span></a>
              <a href={contacts.instagram} target="_blank" rel="noreferrer" onClick={() => trackEvent('contact_click_instagram', { placement: 'custom_order_modal' })}>Instagram <span>→</span></a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
