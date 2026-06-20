import { contacts } from '../../data/contacts';
import { useProducts } from '../../hooks/useProducts';
import { trackEvent } from '../../lib/api';
import './FinalCta.css';

export function FinalCta() {
  const { finalCtaProducts } = useProducts();
  const featuredProduct = finalCtaProducts[0];

  return (
    <section className="section finalCta">
      <div className="container">
        <div className="finalCtaCard" data-reveal>
          <span className="badge">Заявка</span>
          <h2>Хочешь игровой ПК без долгого поиска комплектующих?</h2>
          <p>{featuredProduct ? `Сейчас рекомендуем: ${featuredProduct.title} за ${featuredProduct.price}. Напиши нам, чтобы уточнить наличие.` : 'Напиши нам — подберём сборку под твой бюджет и задачи.'}</p>
          <div className="finalCtaActions">
            <a className="button buttonPrimary" href={contacts.vk} target="_blank" rel="noreferrer" onClick={() => trackEvent('contact_click_vk', { placement: 'final_cta' })}>
              Консультация в VK
            </a>
            <a className="button buttonSecondary" href={contacts.telegram} target="_blank" rel="noreferrer" onClick={() => trackEvent('contact_click_telegram', { placement: 'final_cta' })}>
              Telegram
            </a>
            <a className="button buttonSecondary" href={contacts.instagram} target="_blank" rel="noreferrer" onClick={() => trackEvent('contact_click_instagram', { placement: 'final_cta' })}>
              Instagram
            </a>
            <a className="button buttonSecondary" href={contacts.avito} target="_blank" rel="noreferrer" onClick={() => trackEvent('contact_click_avito', { placement: 'final_cta' })}>
              Avito
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
