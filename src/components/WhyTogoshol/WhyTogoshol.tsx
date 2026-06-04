import { benefits } from '../../data/benefits';
import './WhyTogoshol.css';

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
      </div>
    </section>
  );
}
