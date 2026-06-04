import './Footer.css';

const sectionLinks = [
  { label: 'Сборки', href: '#builds' },
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
          <a href="tel:+70000000000">Телефон</a>
          <a href="https://t.me/" target="_blank" rel="noreferrer">
            Telegram
          </a>
          <a href="mailto:hello@togoshol.ru">Email</a>
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
