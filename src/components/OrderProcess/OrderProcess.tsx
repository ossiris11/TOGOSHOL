import { steps } from '../../data/steps';
import './OrderProcess.css';

export function OrderProcess() {
  return (
    <section id="process" className="section process">
      <div className="container">
        <div className="sectionHeader" data-reveal>
          <h2 className="sectionTitle">Как проходит заказ</h2>
        </div>
        <div className="stepsGrid">
          {steps.map((step) => (
            <article className="stepCard" key={step.number} data-reveal>
              <span>{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
