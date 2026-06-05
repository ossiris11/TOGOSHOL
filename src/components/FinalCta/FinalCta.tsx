import { contacts } from '../../data/contacts';
import { trackEvent } from '../../lib/api';
import './FinalCta.css';

export function FinalCta() {
  return (
    <section className="section finalCta">
      <div className="container">
        <div className="finalCtaCard" data-reveal>
          <span className="badge">Заявка</span>
          <h2>Хочешь игровой ПК без долгого поиска комплектующих?</h2>
          <p>Напиши нам — подберём сборку под твой бюджет и задачи.</p>
          <div className="finalCtaActions">
            <a className="button buttonPrimary" href={contacts.vk} target="_blank" rel="noreferrer" onClick={() => trackEvent('contact_click_vk', { placement: 'final_cta' })}>
              Написать в VK
            </a>
            <a className="button buttonSecondary" href={contacts.telegram} target="_blank" rel="noreferrer" onClick={() => trackEvent('contact_click_telegram', { placement: 'final_cta' })}>
              Telegram
            </a>
            <a className="button buttonSecondary" href={contacts.max} target="_blank" rel="noreferrer" onClick={() => trackEvent('contact_click_max', { placement: 'final_cta' })}>
              Max
            </a>
            <a className="button buttonSecondary" href="#custom">
              Собрать под задачу
            </a>
          </div>
          <small>Ответим по наличию, срокам сборки и вариантам апгрейда.</small>
        </div>
      </div>
    </section>
  );
}
