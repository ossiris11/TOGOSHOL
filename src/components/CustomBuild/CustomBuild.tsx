import { useMemo, useState } from 'react';
import { vkProducts } from '../../data/vkProducts';
import { getClosestProducts } from '../../lib/products';
import './CustomBuild.css';

const games = ['Cyberpunk 2077', 'Counter-Strike 2', 'Работа / 3D / AI'] as const;
const resolutions = ['1080p', '1440p', '4K'] as const;
const partConditions = ['Новые', 'Б/у выгоднее', 'Не важно'] as const;
const ramOptions = ['16GB', '32GB', '64GB'] as const;
const storageOptions = ['512GB', '1TB', '2TB'] as const;

type Game = (typeof games)[number];
type Resolution = (typeof resolutions)[number];
type PartCondition = (typeof partConditions)[number];
type RamOption = (typeof ramOptions)[number];
type StorageOption = (typeof storageOptions)[number];

const included = [
  'Индивидуальный подбор комплектующих',
  'Идеальный кабель-менеджмент',
  'Windows 11 Pro и настройка драйверов',
  'Температурные стресс-тесты',
];

function formatPrice(value: number) {
  return new Intl.NumberFormat('ru-RU').format(value) + ' ₽';
}

function getBuildClass(budget: number, resolution: Resolution) {
  if (budget >= 210000 || (resolution === '4K' && budget >= 160000)) return 'Флагманский ULTRA';
  if (budget >= 120000 || resolution === '1440p') return 'Сбалансированный PRO';
  return 'Стартовый START';
}

function getRecommendation(budget: number, game: Game, resolution: Resolution, ramChoice: RamOption, storageChoice: StorageOption) {
  const workMode = game === 'Работа / 3D / AI';
  const ultra = budget >= 210000 || (resolution === '4K' && budget >= 160000);
  const pro = budget >= 120000 || resolution === '1440p';

  const gpu = ultra
    ? 'Nvidia RTX 5080 16GB'
    : pro
      ? 'Nvidia RTX 4070 Super 12GB'
      : budget >= 80000
        ? 'Nvidia RTX 5060 8GB'
        : 'RTX 3060 Ti / RX 6700 XT';

  const cpu = ultra
    ? 'AMD Ryzen 7 7800X3D'
    : pro
      ? 'AMD Ryzen 5 7500F / 7600X'
      : 'Ryzen 5 5500 / Intel i5-12400F';

  const ram = workMode && ramChoice === '16GB' ? '32GB DDR5 Dual Channel' : `${ramChoice} DDR5 / DDR4`;
  const storage = `NVMe SSD ${storageChoice}`;
  const cooling = ultra ? 'СЖО 240–360mm ARGB' : pro ? 'СЖО 240mm / башня' : 'Тихое воздушное охлаждение';

  const baseFps = game === 'Counter-Strike 2' ? 430 : game === 'Cyberpunk 2077' ? 112 : 145;
  const budgetFactor = budget / 120000;
  const resolutionFactor = resolution === '1080p' ? 1.18 : resolution === '1440p' ? 1 : 0.62;
  const fps = Math.max(45, Math.round(baseFps * budgetFactor * resolutionFactor));

  return {
    buildClass: getBuildClass(budget, resolution),
    status: budget >= 90000 ? 'Оптимально' : 'Бюджетно',
    gpu,
    cpu,
    ram,
    storage,
    cooling,
    fps,
  };
}

export function CustomBuild() {
  const [budget, setBudget] = useState(120000);
  const [game, setGame] = useState<Game>('Counter-Strike 2');
  const [resolution, setResolution] = useState<Resolution>('1440p');
  const [partCondition, setPartCondition] = useState<PartCondition>('Не важно');
  const [ramChoice, setRamChoice] = useState<RamOption>('32GB');
  const [storageChoice, setStorageChoice] = useState<StorageOption>('1TB');
  const [copied, setCopied] = useState(false);

  const recommendation = useMemo(
    () => getRecommendation(budget, game, resolution, ramChoice, storageChoice),
    [budget, game, ramChoice, resolution, storageChoice],
  );
  const closestProducts = useMemo(() => getClosestProducts(vkProducts, budget, 3), [budget]);
  const hasBudgetWarning = resolution === '4K' && budget < 160000;

  const messageText = `Здравствуйте! Хочу обсудить сборку TOGOSHOL.
Бюджет: ${formatPrice(budget)}
Игра/задача: ${game}
Разрешение: ${resolution}
Комплектующие: ${partCondition}
RAM: ${ramChoice}
SSD: ${storageChoice}
Рекомендация сайта: ${recommendation.buildClass}, ${recommendation.cpu}, ${recommendation.gpu}, ${recommendation.ram}, ${recommendation.storage}.`;

  const copyMessage = async () => {
    await navigator.clipboard.writeText(messageText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <section id="custom" className="section customBuild">
      <div className="container">
        <div className="configurator" data-reveal>
          <div className="configuratorCopy">
            <span className="badge">Индивидуальный калькулятор</span>
            <h2>
              Соберём ПК под <span>твою задачу</span>
            </h2>
            <p>
              Укажи ориентировочный бюджет и ключевые требования. Мы моментально рассчитаем класс сборки и подготовим
              основу для разговора с инженером.
            </p>

            <div className="configControls" aria-label="Настройки конфигуратора">
              <label className="budgetControl">
                <span>
                  <b>Комфортный бюджет:</b>
                  <strong>{formatPrice(budget)}</strong>
                </span>
                <input
                  type="range"
                  min="50000"
                  max="300000"
                  step="5000"
                  value={budget}
                  onChange={(event) => setBudget(Number(event.target.value))}
                  aria-label="Комфортный бюджет"
                />
                <i>
                  <small>50 000 ₽</small>
                  <small>150 000 ₽</small>
                  <small>300 000 ₽</small>
                </i>
              </label>

              <div className="controlGroup">
                <span>Любимая игра для теста:</span>
                <div className="segmented" role="radiogroup" aria-label="Игра или задача">
                  {games.map((item) => (
                    <button
                      className={game === item ? 'isActive' : ''}
                      key={item}
                      type="button"
                      role="radio"
                      aria-checked={game === item}
                      onClick={() => setGame(item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="controlGroup">
                <span>Разрешение монитора:</span>
                <div className="segmented" role="radiogroup" aria-label="Разрешение монитора">
                  {resolutions.map((item) => (
                    <button
                      className={resolution === item ? 'isActive' : ''}
                      key={item}
                      type="button"
                      role="radio"
                      aria-checked={resolution === item}
                      onClick={() => setResolution(item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="controlGroup">
                <span>Комплектующие:</span>
                <div className="segmented" role="radiogroup" aria-label="Тип комплектующих">
                  {partConditions.map((item) => (
                    <button
                      className={partCondition === item ? 'isActive' : ''}
                      key={item}
                      type="button"
                      role="radio"
                      aria-checked={partCondition === item}
                      onClick={() => setPartCondition(item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="controlGroup">
                <span>Память и накопитель:</span>
                <div className="segmented segmentedCompact" role="radiogroup" aria-label="Оперативная память">
                  {ramOptions.map((item) => (
                    <button className={ramChoice === item ? 'isActive' : ''} key={item} type="button" role="radio" aria-checked={ramChoice === item} onClick={() => setRamChoice(item)}>
                      {item}
                    </button>
                  ))}
                </div>
                <div className="segmented segmentedCompact" role="radiogroup" aria-label="Накопитель">
                  {storageOptions.map((item) => (
                    <button className={storageChoice === item ? 'isActive' : ''} key={item} type="button" role="radio" aria-checked={storageChoice === item} onClick={() => setStorageChoice(item)}>
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {hasBudgetWarning && (
              <p className="configWarning">
                Для комфортного 4K обычно нужен бюджет выше 160 000 ₽. В текущем бюджете лучше рассмотреть 1440p или
                сборку под заказ с акцентом на видеокарту.
              </p>
            )}

            <ul className="configIncluded">
              {included.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            <div className="configActions">
              <a className="button buttonPrimary configButton" href="https://vk.me/tog_pc" target="_blank" rel="noreferrer">
                Обсудить эту сборку с инженером
              </a>
              <button className="button buttonSecondary configCopyButton" type="button" onClick={copyMessage}>
                {copied ? 'Скопировано' : 'Скопировать конфигурацию'}
              </button>
            </div>
            <p className="configNote">
              Расчёт ориентировочный. Итоговую конфигурацию уточним по наличию, ценам комплектующих и состоянию деталей.
            </p>
          </div>

          <aside className="recommendationCard" aria-live="polite">
            <div className="recommendationHeader">
              <span>Рекомендуемый класс</span>
              <b>{recommendation.status}</b>
            </div>
            <h3>{recommendation.buildClass}</h3>

            <dl className="specTable">
              <div>
                <dt>Видеокарта:</dt>
                <dd>{recommendation.gpu}</dd>
              </div>
              <div>
                <dt>Процессор:</dt>
                <dd>{recommendation.cpu}</dd>
              </div>
              <div>
                <dt>Оперативная память:</dt>
                <dd>{recommendation.ram}</dd>
              </div>
              <div>
                <dt>Накопитель:</dt>
                <dd>{recommendation.storage}</dd>
              </div>
              <div>
                <dt>Охлаждение:</dt>
                <dd>{recommendation.cooling}</dd>
              </div>
            </dl>

            <div className="fpsBox">
              <span>
                Оценка FPS в {game}
                <small>{resolution}</small>
              </span>
              <strong>~{recommendation.fps}</strong>
              <small>кадров/сек</small>
            </div>

            <div className="closestProducts">
              <span>Ближайшие товары из VK</span>
              {closestProducts.map((product) => (
                <a key={product.vkUrl || product.title} href={product.vkUrl} target="_blank" rel="noreferrer">
                  <b>{product.normalizedTitle}</b>
                  <small>{product.price}</small>
                </a>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
