import { benefits } from '../../data/benefits';
import './WhyTogoshol.css';

const trustItems = [
  {
    title: 'Гарантия',
    text: 'Фиксируем комплектующие и проверяем ПК перед передачей. Условия по гарантии уточняются по конкретной сборке.',
  },
  {
    title: 'Сроки',
    text: 'Готовые позиции — по наличию. Под заказ — после согласования бюджета, корпуса и комплектующих.',
  },
  {
    title: 'Оплата',
    text: 'Перед сборкой согласуем смету. Для кастомного заказа может потребоваться предоплата на комплектующие.',
  },
  {
    title: 'Выдача',
    text: 'Локально в Великом Новгороде: можно обсудить сборку, забрать ПК и получить помощь с запуском.',
  },
];

export function WhyTogoshol() {
  return (
    <section id="why" className="section why">
      <div className="container">
        <div className="sectionHeader" data-reveal>
          <h2 className="sectionTitle">Почему TOGOSHOL</h2>
        </div>
        <div className="benefitsGrid">
          {benefits.map((benefit, index) => (
            <article className="benefitCard card" key={benefit.title} data-reveal>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <h3>{benefit.title}</h3>
              <p>{benefit.text}</p>
            </article>
          ))}
        </div>

        <div className="trustPanel" data-reveal>
          <div className="trustPanelHeader">
            <span className="badge">Условия</span>
            <h3>Что важно до покупки</h3>
          </div>
          <div className="trustGrid">
            {trustItems.map((item) => (
              <article key={item.title}>
                <h4>{item.title}</h4>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
