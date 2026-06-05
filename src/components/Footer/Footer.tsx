import { contacts } from '../../data/contacts';
import './Footer.css';

const sectionLinks = [
  { label: 'Сборки', href: '#catalog' },
  { label: 'Под заказ', href: '#custom' },
  { label: 'Почему мы', href: '#why' },
  { label: 'Как заказать', href: '#process' },
];

export function Footer() {
  return (
    <footer className="footer">
      <div className="footerInner container">
        <div className="footerBrand">
          <strong>TOGOSHOL</strong>
          <p>Игровые ПК и кастомные сборки в Великом Новгороде.</p>
        </div>
        <div className="footerColumn">
          <h2>Контакты</h2>
          <a href={contacts.vk} target="_blank" rel="noreferrer">
            VK сообщения
          </a>
          <a href={contacts.telegram} target="_blank" rel="noreferrer">
            Telegram
          </a>
          <a href={contacts.instagram} target="_blank" rel="noreferrer">
            Instagram
          </a>
          <a href={contacts.avito} target="_blank" rel="noreferrer">
            Avito
          </a>
          <a href={contacts.email}>Email</a>
        </div>
        <div className="footerColumn">
          <h2>Разделы</h2>
          {sectionLinks.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </div>
      </div>
      <div className="footerBottom container">© 2026 TOGOSHOL. Все права защищены.</div>
    </footer>
  );
}
