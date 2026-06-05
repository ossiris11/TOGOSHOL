import { useState } from 'react';
import { useHeaderScrolled } from '../../hooks/useHeaderScrolled';
import { contacts } from '../../data/contacts';
import './Header.css';

const navLinks: Array<{ label: string; href: string; external?: boolean }> = [
  { label: 'Сборки', href: '#catalog' },
  { label: 'Конфигуратор', href: '#custom' },
  { label: 'Под заказ', href: '#custom' },
  { label: 'Почему мы', href: '#why' },
  { label: 'Как заказать', href: '#process' },
];

export function Header() {
  const isScrolled = useHeaderScrolled();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [city, setCity] = useState('Великий Новгород');

  const closeMenu = () => setIsMobileMenuOpen(false);

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
            <a key={link.href} href={link.href} target={link.external ? '_blank' : undefined} rel={link.external ? 'noreferrer' : undefined}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className="headerActions">
          <a className="phoneLink" href={contacts.vk} target="_blank" rel="noreferrer">
            VK / TG / Max
          </a>
          <a className="button buttonPrimary headerButton" href={contacts.vk} target="_blank" rel="noreferrer">
            Написать
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
              onClick={closeMenu}
            >
              {link.label}
            </a>
          ))}
          <a href={contacts.vk} target="_blank" rel="noreferrer" onClick={closeMenu}>
            VK сообщения
          </a>
          <a href={contacts.telegram} target="_blank" rel="noreferrer" onClick={closeMenu}>
            Telegram
          </a>
          <a href={contacts.max} target="_blank" rel="noreferrer" onClick={closeMenu}>
            Max
          </a>
          <a className="button buttonPrimary" href={contacts.vk} target="_blank" rel="noreferrer" onClick={closeMenu}>
            Написать
          </a>
        </nav>
      </div>
    </header>
  );
}
