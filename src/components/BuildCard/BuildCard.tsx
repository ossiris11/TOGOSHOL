import type { Build } from '../../data/builds';
import { PcMockup } from '../PcMockup/PcMockup';
import './BuildCard.css';

export function BuildCard({ badge, badgeType = 'default', title, subtitle, specs, price, cta }: Build) {
  return (
    <article className={`buildCard card buildCard-${title.toLowerCase()}`} data-reveal>
      <div className="buildCardTop">
        <span className={`badge ${badgeType === 'available' ? 'badgeAvailable' : ''}`}>{badge}</span>
        <h3>{title}</h3>
        <p>{subtitle}</p>
      </div>
      <PcMockup size="mini" />
      <ul className="specList">
        {specs.map((spec) => (
          <li key={spec}>{spec}</li>
        ))}
      </ul>
      <div className="buildCardBottom">
        <strong>{price}</strong>
        <a className="button buttonSecondary" href="https://t.me/" target="_blank" rel="noreferrer" aria-label={cta}>
          {cta}
        </a>
      </div>
    </article>
  );
}
