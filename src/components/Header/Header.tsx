import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { useHeaderScrolled } from '../../hooks/useHeaderScrolled';
import { contacts } from '../../data/contacts';
import { trackEvent } from '../../lib/api';
import logo from '../../assets/togoshol-logo.svg';
import './Header.css';

const navLinks: Array<{ label: string; href: string; external?: boolean; action?: 'customParts' }> = [
  { label: 'Каталог ПК', href: '/#catalog' },
  { label: 'Этапы работы', href: '/#process' },
  { label: 'Отзывы', href: '/#reviews' },
  { label: 'Под заказ', href: '/#custom-parts', action: 'customParts' },
  { label: 'Апгрейд', href: '/upgrade-pc-velikiy-novgorod' },
  { label: 'Контакты', href: '/contacts' },
];

const socialLinks = [
  { label: 'VK', title: 'VK', href: contacts.vk, channel: 'vk' },
  { label: 'Telegram', title: 'Telegram', href: contacts.telegram, channel: 'telegram' },
  { label: 'Instagram', title: 'Instagram', href: contacts.instagram, channel: 'instagram' },
  { label: 'Avito', title: 'Avito', href: contacts.avito, channel: 'avito' },
] as const;

type SocialChannel = (typeof socialLinks)[number]['channel'];

function SocialIcon({ channel }: { channel: SocialChannel }) {
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

  if (channel === 'telegram') {
    return (
      <svg viewBox="0 0 28 28" aria-hidden="true">
        <path
          d="M23.6 6.1 3.7 13.8c-1.2.5-1.2 1.2-.2 1.5l5.1 1.6 2 6.1c.3.8.5 1.1 1 1.1.5 0 .8-.2 1.2-.6l2.9-2.8 5.9 4.3c1.1.6 1.8.3 2.1-1l3.8-18c.4-1.4-.5-2-1.9-1.5Zm-5.1 4.3-9.7 8.8-.3 3.5-1.8-5.8 13.5-8.5c.6-.4 1.1-.2.5.4Z"
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
    <svg viewBox="0 0 28 28" aria-hidden="true" className="avitoGlyph">
      <circle cx="10" cy="9" r="4.1" fill="#00AEEF" />
      <circle cx="18.2" cy="11.3" r="3.6" fill="#97CF26" />
      <circle cx="11.5" cy="18.5" r="3.2" fill="#FF4053" />
      <circle cx="19.5" cy="19.2" r="2.8" fill="#8C45FF" />
    </svg>
  );
}

export function Header() {
  const isScrolled = useHeaderScrolled();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const closeMenu = (restoreFocus = false) => {
    setIsMobileMenuOpen(false);
    if (restoreFocus) window.setTimeout(() => menuButtonRef.current?.focus(), 0);
  };
  const handleNavClick = (event: MouseEvent<HTMLAnchorElement>, action?: 'customParts') => {
    if (action === 'customParts') {
      if (window.location.pathname !== '/') {
        closeMenu();
        return;
      }

      event.preventDefault();
      window.dispatchEvent(new CustomEvent('togoshol:open-custom-parts'));
    }
    closeMenu();
  };
  const trackContact = (channel: 'vk' | 'telegram' | 'instagram' | 'avito', placement: string) => {
    trackEvent(`contact_click_${channel}`, { placement });
  };

  useEffect(() => {
    if (!isMobileMenuOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    const firstLink = mobileMenuRef.current?.querySelector<HTMLAnchorElement>('a');
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeMenu(true);
    };

    document.body.style.overflow = 'hidden';
    firstLink?.focus();
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMobileMenuOpen]);

  return (
    <header className={`header ${isScrolled ? 'isScrolled' : ''}`}>
      <div className="headerInner container">
        <a className="brand" href="/" onClick={() => closeMenu()} aria-label="TOGOSHOL, на главный экран">
          <img src={logo} alt="T-PC" />
        </a>

        <nav className="desktopNav" aria-label="Основная навигация">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} target={link.external ? '_blank' : undefined} rel={link.external ? 'noreferrer' : undefined} onClick={(event) => handleNavClick(event, link.action)}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className="headerActions">
          <div className="headerSocials" aria-label="Социальные сети">
            {socialLinks.map((link) => (
              <a
                key={link.channel}
                className={`socialIcon socialIcon-${link.channel}`}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                aria-label={`${link.label} TOGOSHOL`}
                title={link.title}
                onClick={() => trackContact(link.channel, 'header_socials')}
              >
                <SocialIcon channel={link.channel} />
              </a>
            ))}
          </div>
          <a className="button buttonPrimary headerButton" href={contacts.vk} target="_blank" rel="noreferrer" onClick={() => trackContact('vk', 'header_button')}>
            Консультация
          </a>
        </div>

        <button
          ref={menuButtonRef}
          className="menuButton"
          type="button"
          aria-label={isMobileMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-menu"
          onClick={() => setIsMobileMenuOpen((value) => !value)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <div
        id="mobile-menu"
        className={`mobileMenu ${isMobileMenuOpen ? 'isOpen' : ''}`}
        role="presentation"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) closeMenu(true);
        }}
      >
        <nav ref={mobileMenuRef} className="mobileMenuInner container" aria-label="Мобильная навигация">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target={link.external ? '_blank' : undefined}
              rel={link.external ? 'noreferrer' : undefined}
              onClick={(event) => handleNavClick(event, link.action)}
            >
              {link.label}
            </a>
          ))}
          <a href={contacts.vk} target="_blank" rel="noreferrer" onClick={() => { trackContact('vk', 'mobile_menu'); closeMenu(); }}>
            VK сообщения
          </a>
          <a href={contacts.telegram} target="_blank" rel="noreferrer" onClick={() => { trackContact('telegram', 'mobile_menu'); closeMenu(); }}>
            Telegram
          </a>
          <a href={contacts.instagram} target="_blank" rel="noreferrer" onClick={() => { trackContact('instagram', 'mobile_menu'); closeMenu(); }}>
            Instagram
          </a>
          <a href={contacts.avito} target="_blank" rel="noreferrer" onClick={() => { trackContact('avito', 'mobile_menu'); closeMenu(); }}>
            Avito
          </a>
          <a className="button buttonPrimary" href={contacts.vk} target="_blank" rel="noreferrer" onClick={() => { trackContact('vk', 'mobile_menu_button'); closeMenu(); }}>
            Консультация
          </a>
        </nav>
      </div>
    </header>
  );
}
