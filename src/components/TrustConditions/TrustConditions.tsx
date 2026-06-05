import { conditions } from '../../data/conditions';
import './TrustConditions.css';

export function TrustConditions() {
  return (
    <section className="section trustConditions" aria-labelledby="trust-title">
      <div className="container">
        <div className="trustConditionsInner" data-reveal>
          <div className="trustConditionsHeader">
            <span className="badge">Условия</span>
            <h2 id="trust-title" className="sectionTitle">Что важно до покупки</h2>
            <p className="sectionText">
              Перед сборкой фиксируем конфигурацию, стоимость и ожидания. Так сайт остаётся красивым, а покупка — понятной.
            </p>
          </div>
          <div className="conditionsGrid">
            {conditions.map((item) => (
              <article key={item.title} className="conditionCard">
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
