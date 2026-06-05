import { contacts } from '../../data/contacts';
import './NotFound.css';

export function NotFound() {
  return (
    <main className="notFoundPage">
      <section className="notFoundContent">
        <div className="notFoundCopy">
          <span className="badge">404</span>
          <h1>Страница не найдена</h1>
          <p>Адрес не существует или сборку уже перенесли. Можно вернуться к каталогу или написать нам напрямую.</p>
          <div className="notFoundActions">
            <a className="button buttonPrimary" href="/">На главную</a>
            <a className="button buttonSecondary" href="/#catalog">Каталог</a>
            <a className="button buttonSecondary" href={contacts.vk} target="_blank" rel="noreferrer">VK</a>
          </div>
        </div>

        <div className="catPcScene" aria-label="Рыжий кот рядом с компьютером">
          <div className="monitor">
            <span />
          </div>
          <div className="pcTower">
            <i />
            <b />
          </div>
          <div className="cat">
            <span className="ear earLeft" />
            <span className="ear earRight" />
            <span className="head">
              <i />
              <b />
              <em />
            </span>
            <span className="body" />
            <span className="tail" />
          </div>
          <div className="desk" />
        </div>
      </section>
    </main>
  );
}
