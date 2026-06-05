import { faqItems } from '../../data/faq';
import './Faq.css';

export function Faq() {
  return (
    <section className="section faq" aria-labelledby="faq-title">
      <div className="container">
        <div className="faqLayout">
          <div className="sectionHeader" data-reveal>
            <span className="badge">FAQ</span>
            <h2 id="faq-title" className="sectionTitle">Частые вопросы</h2>
            <p className="sectionText">Коротко закрываем базовые сомнения до обращения.</p>
          </div>

          <div className="faqList" data-reveal>
            {faqItems.map((item, index) => (
              <details key={item.question} open={index === 0}>
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
