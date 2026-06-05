import { useEffect, useMemo, useState } from 'react';
import { benefits } from '../../data/benefits';
import { fetchReviews, type ApiReview } from '../../lib/api';
import './WhyTogoshol.css';

const bestReviewGroups = [
  { key: 'avito', title: 'Avito', note: 'Отзывы с площадки и скрины переписки' },
  { key: 'vk', title: 'VK', note: 'Отзывы из сообщений и обсуждений' },
  { key: 'site', title: 'Сайт', note: 'Отзывы, оставленные через сайт' },
] as const;

type ReviewPlaceholder = {
  id: string;
  placeholder: true;
  sourceTitle: string;
};

function sourceMatches(review: ApiReview, source: string) {
  if (source === 'site') return ['site', 'manual', 'screenshot'].includes(review.source);
  return review.source === source;
}

function renderReviewShot(review: ApiReview | ReviewPlaceholder, index: number) {
  if ('placeholder' in review) {
    return (
      <article className="reviewShot isEmpty" key={review.id}>
        <span>{String(index + 1).padStart(2, '0')}</span>
        <strong>Слот под широкий скрин отзыва</strong>
        <small>Добавь отзыв в админке: источник {review.sourceTitle}, статус опубликован.</small>
      </article>
    );
  }

  return (
    <article className="reviewShot" key={review.id}>
      {review.imageUrl ? (
        <img src={review.imageUrl} alt={`Отзыв ${review.authorName}`} loading="lazy" decoding="async" />
      ) : (
        <div className="reviewTextFallback">
          <strong>{review.authorName}</strong>
          <p>{review.text}</p>
        </div>
      )}
      <footer>
        <span>{review.authorName}</span>
        <b>{review.rating}/5</b>
      </footer>
    </article>
  );
}

export function WhyTogoshol() {
  const [reviews, setReviews] = useState<ApiReview[]>([]);
  const [isReviewsExpanded, setIsReviewsExpanded] = useState(false);

  useEffect(() => {
    let alive = true;
    fetchReviews()
      .then((items) => {
        if (alive) setReviews(items);
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);

  const groupedReviews = useMemo(() => {
    return bestReviewGroups.map((group) => ({
      ...group,
      items: reviews.filter((review) => sourceMatches(review, group.key)).slice(0, 8),
    }));
  }, [reviews]);
  const topReviews = useMemo<Array<ApiReview | ReviewPlaceholder>>(() => {
    const realReviews = reviews.slice(0, 3);
    if (realReviews.length === 3) return realReviews;

    return [
      ...realReviews,
      ...bestReviewGroups.slice(realReviews.length, 3).map((group, index) => ({
        id: `top-${group.key}-${index}`,
        placeholder: true as const,
        sourceTitle: group.title,
      })),
    ];
  }, [reviews]);

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

        <div className={`bestReviews ${isReviewsExpanded ? 'isExpanded' : ''}`}>
          <div className="bestReviewsHeader">
            <div>
              <span className="badge">Лучшие отзывы</span>
              <h3>Топ отзывов TOGOSHOL</h3>
              <p>Короткая витрина показывает три сильных отзыва. Внутри можно раскрыть больше скринов из Avito, VK и сайта.</p>
            </div>
            <button type="button" onClick={() => setIsReviewsExpanded((value) => !value)} aria-expanded={isReviewsExpanded} aria-controls="best-reviews-expanded">
              {isReviewsExpanded ? 'Свернуть' : 'Показать больше'}
            </button>
          </div>

          <div className="bestReviewsTop" aria-label="Топ 3 отзыва">
            {topReviews.map((review, index) => renderReviewShot(review, index))}
          </div>

          <div id="best-reviews-expanded" className="bestReviewsExpanded" aria-hidden={!isReviewsExpanded}>
            {groupedReviews.map((group) => (
              <section className="bestReviewColumn" key={group.key} aria-label={`Отзывы ${group.title}`}>
                <header>
                  <b>{group.title}</b>
                  <span>{group.note}</span>
                </header>
                <div className="bestReviewStack">
                  {(group.items.length > 0
                    ? group.items
                    : Array.from({ length: 6 }, (_, index) => ({ id: `${group.key}-${index}`, placeholder: true as const, sourceTitle: group.title }))
                  ).map((review, index) => renderReviewShot(review, index))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
