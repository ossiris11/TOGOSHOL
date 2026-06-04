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
            <a className="button buttonPrimary" href="https://t.me/" target="_blank" rel="noreferrer">
              Написать в Telegram
            </a>
            <a className="button buttonSecondary" href="tel:+70000000000">
              Позвонить
            </a>
          </div>
          <small>Ответим по наличию, срокам сборки и вариантам апгрейда.</small>
        </div>
      </div>
    </section>
  );
}
