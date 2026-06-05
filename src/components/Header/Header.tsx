import { useState, type MouseEvent } from 'react';
import { useHeaderScrolled } from '../../hooks/useHeaderScrolled';
import { contacts } from '../../data/contacts';
import { trackEvent } from '../../lib/api';
import './Header.css';

const navLinks: Array<{ label: string; href: string; external?: boolean; action?: 'customParts' }> = [
  { label: 'Сборки', href: '#catalog' },
  { label: 'Конфигуратор', href: '#custom' },
  { label: 'Под заказ', href: '#custom-parts', action: 'customParts' },
  { label: 'Почему мы', href: '#why' },
  { label: 'Как заказать', href: '#process' },
];

const socialLinks = [
  { label: 'VK', href: contacts.vk, channel: 'vk' },
  { label: 'TG', href: contacts.telegram, channel: 'telegram' },
  { label: 'IG', href: contacts.instagram, channel: 'instagram' },
  { label: 'AV', href: contacts.avito, channel: 'avito' },
] as const;

export function Header() {
  const isScrolled = useHeaderScrolled();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [city, setCity] = useState('Великий Новгород');

  const closeMenu = () => setIsMobileMenuOpen(false);
  const handleNavClick = (event: MouseEvent<HTMLAnchorElement>, action?: 'customParts') => {
    if (action === 'customParts') {
      event.preventDefault();
      window.dispatchEvent(new CustomEvent('togoshol:open-custom-parts'));
    }
    closeMenu();
  };
  const trackContact = (channel: 'vk' | 'telegram' | 'instagram' | 'avito', placement: string) => {
    trackEvent(`contact_click_${channel}`, { placement });
  };

  return (
    <header className={`header ${isScrolled ? 'isScrolled' : ''}`}>
      <div className="headerInner container">
        <a className="brand" href="#top" onClick={closeMenu} aria-label="TOGOSHOL, на главный экран">
          <span>TOGOSHOL</span>
        </a>

        <label className="citySelect">
          <span className="srOnly">Выберите город</span>
          <select value={city} onChange={(event) => setCity(event.target.value)} aria-label="Выберите город">
            <option>Великий Новгород</option>
            <option>Санкт-Петербург</option>
          </select>
        </label>

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
                aria-label={link.label === 'AV' ? 'Avito TOGOSHOL' : `${link.label} TOGOSHOL`}
                title={link.label === 'AV' ? 'Avito' : link.label}
                onClick={() => trackContact(link.channel, 'header_socials')}
              >
                {link.label}
              </a>
            ))}
          </div>
          <a className="button buttonPrimary headerButton" href={contacts.vk} target="_blank" rel="noreferrer" onClick={() => trackContact('vk', 'header_button')}>
            Консультация
          </a>
        </div>

        <button
          className="menuButton"
          type="button"
          aria-label={isMobileMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-menu"
          onClick={() => setIsMobileMenuOpen((value) => !value)}
        >
          <span />
          <span />
        </button>
      </div>

      <div id="mobile-menu" className={`mobileMenu ${isMobileMenuOpen ? 'isOpen' : ''}`}>
        <nav className="mobileMenuInner container" aria-label="Мобильная навигация">
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
