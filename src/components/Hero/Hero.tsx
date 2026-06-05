import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { useHeroParallax } from '../../hooks/useHeroParallax';
import { contacts } from '../../data/contacts';
import { trackEvent } from '../../lib/api';
import heroPc from '../../assets/hero-pc-2026-cutout.webp';
import './Hero.css';

const customSpecs = [
  { label: 'Видеокарта', value: 'RTX / Radeon под бюджет', icon: 'gpu' },
  { label: 'Процессор', value: 'Ryzen 5-9 / Intel i5-i9', icon: 'cpu' },
  { label: 'Память', value: '32-64GB DDR4 / DDR5', icon: 'memory' },
  { label: 'Охлаждение', value: 'Airflow / СЖО 240-360mm', icon: 'cooling' },
] as const;

type CustomSpecIcon = (typeof customSpecs)[number]['icon'];

function SpecIcon({ icon }: { icon: CustomSpecIcon }) {
  if (icon === 'gpu') {
    return (
      <svg viewBox="0 0 28 28" aria-hidden="true">
        <rect x="5" y="8" width="17" height="12" rx="2.5" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="12" cy="14" r="3.2" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M22 11h2.5M22 17h2.5M7 20v3M12 20v3M17 20v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  if (icon === 'cpu') {
    return (
      <svg viewBox="0 0 28 28" aria-hidden="true">
        <rect x="8" y="8" width="12" height="12" rx="2.2" fill="none" stroke="currentColor" strokeWidth="2" />
        <rect x="11.5" y="11.5" width="5" height="5" rx="1" fill="currentColor" />
        <path d="M10 4v3M14 4v3M18 4v3M10 21v3M14 21v3M18 21v3M4 10h3M4 14h3M4 18h3M21 10h3M21 14h3M21 18h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  if (icon === 'memory') {
    return (
      <svg viewBox="0 0 28 28" aria-hidden="true">
        <rect x="5" y="9" width="18" height="10" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M8 19v3M12 19v3M16 19v3M20 19v3M9 13h2M14 13h2M19 13h1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 28 28" aria-hidden="true">
      <circle cx="14" cy="14" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M14 6v8l5.6 5.6M14 14 8.4 19.6M14 14h7.8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="14" cy="14" r="2" fill="currentColor" />
    </svg>
  );
}

type CustomSocialChannel = 'vk' | 'avito' | 'instagram';

function CustomSocialIcon({ channel }: { channel: CustomSocialChannel }) {
  if (channel === 'vk') {
    return (
      <svg viewBox="0 0 28 28" aria-hidden="true">
        <path
          d="M5.2 9.1c.2 7.2 3.8 11.4 10 11.4h.4v-4.1c2.3.2 4 1.9 4.7 4.1h3.6c-.9-3.3-3.2-5.1-4.6-5.8 1.4-.9 3.7-3.2 4.2-5.6h-3.3c-.7 2.3-2.6 4.4-4.6 4.6V9.1h-3.4v8c-2.1-.5-4.8-2.8-4.9-8H5.2Z"
          fill="currentColor"
        />
      </svg>
    );
  }

  if (channel === 'instagram') {
    return (
      <svg viewBox="0 0 28 28" aria-hidden="true">
        <rect x="6.3" y="6.3" width="15.4" height="15.4" rx="4.5" fill="none" stroke="currentColor" strokeWidth="2.1" />
        <circle cx="14" cy="14" r="4" fill="none" stroke="currentColor" strokeWidth="2.1" />
        <circle cx="19" cy="9" r="1.35" fill="currentColor" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 28 28" aria-hidden="true" className="customAvitoGlyph">
      <circle cx="10" cy="9" r="4.1" fill="#00AEEF" />
      <circle cx="18.2" cy="11.3" r="3.6" fill="#97CF26" />
      <circle cx="11.5" cy="18.5" r="3.2" fill="#FF4053" />
      <circle cx="19.5" cy="19.2" r="2.8" fill="#8C45FF" />
    </svg>
  );
}

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
          <span className="badge heroBadge">Готовые и кастомные игровые компьютеры</span>
          <h1 className="heroTitle">
            <span>Игровые</span>
            <span><b>компьютеры</b></span>
            <span>по <b>всей России</b></span>
          </h1>
          <p className="heroSubtitle">
            Собираем мощные компьютеры под игры, стриминг и работу. Подберём комплектующие, протестируем систему,
            подготовим к отправке и поможем с подключением.
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
              <strong>В Новгороде</strong>
              <span>территориально в Великом Новгороде</span>
            </div>
          </div>
        </div>

        <div className="heroVisual" ref={visualRef}>
          <div className="heroVisualInner">
            <div className="heroPcPhotoFrame">
              <img src={heroPc} alt="Топовый игровой компьютер 2026 без фона с RGB-подсветкой" />
              <span className="heroPcPhotoGlow" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>

      <div className="customPcBand" aria-labelledby="custom-pc-title">
        <div className="container customPcLayout">
          <article className="customPcCard">
            <div className="customPcImage">
              <img src={heroPc} alt="Кастомный игровой компьютер 2026" />
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
                  <span className="customSpecIcon"><SpecIcon icon={spec.icon} /></span>
                  <span className="customSpecLabel">{spec.label}</span>
                  <strong><span>{spec.value}</span></strong>
                  <i aria-hidden="true" />
                </div>
              ))}
            </div>
          </article>

          <aside className="customPcContacts">
            <h3>Не разбираешься в комплектующих?</h3>
            <p>Напиши нам, подберём лучшее решение под цели и бюджет.</p>
            <a className="customSocialLink customSocialLink-vk" href={contacts.vk} target="_blank" rel="noreferrer" onClick={() => trackEvent('contact_click_vk', { placement: 'hero_custom_block' })}>
              <span className="customSocialGlyph"><CustomSocialIcon channel="vk" /></span>
              <span className="customSocialLabel">VK</span>
            </a>
            <a className="customSocialLink customSocialLink-avito" href={contacts.avito} target="_blank" rel="noreferrer" onClick={() => trackEvent('contact_click_avito', { placement: 'hero_custom_block' })}>
              <span className="customSocialGlyph"><CustomSocialIcon channel="avito" /></span>
              <span className="customSocialLabel">Avito</span>
            </a>
            <a className="customSocialLink customSocialLink-instagram" href={contacts.instagram} target="_blank" rel="noreferrer" onClick={() => trackEvent('contact_click_instagram', { placement: 'hero_custom_block' })}>
              <span className="customSocialGlyph"><CustomSocialIcon channel="instagram" /></span>
              <span className="customSocialLabel">Instagram</span>
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
              <p>Самовывоз из магазина <b>Великий Новгород, Парковая 14к6</b></p>
            </div>

            <div className="customOrderHint">Сначала скопируйте заявку, затем отправьте её нам в любой мессенджер.</div>

            <div className="customOrderActions">
              <button type="button" className="customOrderCopy" onClick={copyRequest}>
                <span className="customSocialLabel">{copyState === 'copied' ? 'Скопировано' : 'Скопировать'}</span>
                <span className="customSocialArrow">⧉</span>
              </button>
              <a className="customSocialLink customSocialLink-avito" href={contacts.avito} target="_blank" rel="noreferrer" onClick={() => trackEvent('contact_click_avito', { placement: 'custom_order_modal' })}>
                <span className="customSocialGlyph"><CustomSocialIcon channel="avito" /></span>
                <span className="customSocialLabel">Avito</span>
              </a>
              <a className="customSocialLink customSocialLink-vk" href={`${contacts.vk}?message=${encodeURIComponent(requestText)}`} target="_blank" rel="noreferrer" onClick={() => trackEvent('contact_click_vk', { placement: 'custom_order_modal' })}>
                <span className="customSocialGlyph"><CustomSocialIcon channel="vk" /></span>
                <span className="customSocialLabel">VK</span>
              </a>
              <a className="customSocialLink customSocialLink-instagram" href={contacts.instagram} target="_blank" rel="noreferrer" onClick={() => trackEvent('contact_click_instagram', { placement: 'custom_order_modal' })}>
                <span className="customSocialGlyph"><CustomSocialIcon channel="instagram" /></span>
                <span className="customSocialLabel">Instagram</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
