import { businessInfo } from '../../data/seo';
import { contacts } from '../../data/contacts';
import './ContactsPage.css';

const contactLinks = [
  { label: 'VK сообщения', href: contacts.vk },
  { label: 'Telegram', href: contacts.telegram },
  { label: 'Avito', href: contacts.avito },
  { label: 'Instagram', href: contacts.instagram },
  { label: 'Телефон', href: contacts.phone },
];

export function ContactsPage() {
  return (
    <main className="contactsPage">
      <section className="contactsHero">
        <div className="container contactsHeroGrid">
          <div>
            <span className="badge">Контакты</span>
            <h1>TOGOSHOL в Великом Новгороде</h1>
            <p>
              Консультация по готовым игровым ПК, сборке компьютера на заказ, самовывозу и доставке. Перед приездом лучше написать,
              чтобы подтвердить наличие и время выдачи.
            </p>
          </div>
          <address className="contactsAddress">
            <span>Адрес выдачи</span>
            <strong>{businessInfo.address.addressLocality}, {businessInfo.address.streetAddress}</strong>
            <p>{businessInfo.address.addressRegion}</p>
            <span>Режим работы</span>
            <strong>09:00-00:00</strong>
            <p>Перед приездом лучше написать и подтвердить время выдачи.</p>
            <span>Телефон</span>
            <strong><a href={contacts.phone}>{contacts.phoneText}</a></strong>
          </address>
        </div>
      </section>

      <section className="section contactsContent" aria-labelledby="contacts-title">
        <div className="container contactsLayout">
          <div>
            <h2 id="contacts-title">Связаться по сборке ПК</h2>
            <p>
              Напиши бюджет, игры, разрешение монитора и пожелания по внешнему виду. Так мы быстрее предложим готовый игровой компьютер
              или конфигурацию под заказ.
            </p>
          </div>
          <div className="contactsLinkGrid">
            {contactLinks.map((link) => (
              <a key={link.label} href={link.href} target={link.href.startsWith('http') ? '_blank' : undefined} rel={link.href.startsWith('http') ? 'noreferrer' : undefined}>
                <span>{link.label}</span>
                <b>Открыть</b>
              </a>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
