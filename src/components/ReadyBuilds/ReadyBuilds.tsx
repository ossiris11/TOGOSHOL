import { builds } from '../../data/builds';
import { BuildCard } from '../BuildCard/BuildCard';
import './ReadyBuilds.css';

export function ReadyBuilds() {
  return (
    <section id="builds" className="section builds">
      <div className="container">
        <div className="sectionHeader" data-reveal>
          <h2 className="sectionTitle">Готовые сборки</h2>
          <p className="sectionText">
            Три понятные конфигурации для разных задач. Можно изменить видеокарту, память, накопитель и корпус.
          </p>
        </div>
        <div className="buildsGrid">
          {builds.map((build) => (
            <BuildCard key={build.title} {...build} />
          ))}
        </div>
      </div>
    </section>
  );
}
