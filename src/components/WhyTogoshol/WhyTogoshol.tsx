import { useEffect, useMemo, useState } from 'react';
import { benefits } from '../../data/benefits';
import { fetchReviews, type ApiReview } from '../../lib/api';
import './WhyTogoshol.css';

const bestReviewGroups = [
  { key: 'avito', title: 'Avito', note: 'Отзывы с площадки и скрины переписки' },
  { key: 'vk', title: 'VK', note: 'Отзывы из сообщений и обсуждений' },
  { key: 'site', title: 'Сайт', note: 'Отзывы, оставленные через сайт' },
] as const;

function sourceMatches(review: ApiReview, source: string) {
  if (source === 'site') return ['site', 'manual', 'screenshot'].includes(review.source);
  return review.source === source;
}

function renderReviewShot(review: ApiReview) {
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
    return bestReviewGroups
      .map((group) => ({
        ...group,
        items: reviews.filter((review) => sourceMatches(review, group.key)).slice(0, 8),
      }))
      .filter((group) => group.items.length > 0);
  }, [reviews]);
  const topReviews = useMemo(() => reviews.slice(0, 3), [reviews]);
  const hasReviews = reviews.length > 0;
  const hasExpandedReviews = groupedReviews.some((group) => group.items.length > 3) || reviews.length > 3;

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

        <span id="reviews" className="reviewsAnchor" aria-hidden="true" />
        {hasReviews && (
        <div className={`bestReviews ${isReviewsExpanded ? 'isExpanded' : ''}`}>
          <div className="bestReviewsHeader">
            <div>
              <span className="badge">Лучшие отзывы</span>
              <h3>Топ отзывов TOGOSHOL</h3>
              <p>Короткая витрина показывает три сильных отзыва. Внутри можно раскрыть больше скринов из Avito, VK и сайта.</p>
            </div>
            {hasExpandedReviews && (
            <button type="button" onClick={() => setIsReviewsExpanded((value) => !value)} aria-expanded={isReviewsExpanded} aria-controls="best-reviews-expanded">
              {isReviewsExpanded ? 'Свернуть' : 'Показать больше'}
            </button>
            )}
          </div>

          <div className="bestReviewsTop" aria-label="Топ 3 отзыва">
            {topReviews.map((review) => renderReviewShot(review))}
          </div>

          {hasExpandedReviews && (
          <div id="best-reviews-expanded" className="bestReviewsExpanded" aria-hidden={!isReviewsExpanded}>
            {groupedReviews.map((group) => (
              <section className="bestReviewColumn" key={group.key} aria-label={`Отзывы ${group.title}`}>
                <header>
                  <b>{group.title}</b>
                  <span>{group.note}</span>
                </header>
                <div className="bestReviewStack">
                  {group.items.map((review) => renderReviewShot(review))}
                </div>
              </section>
            ))}
          </div>
          )}
        </div>
        )}
      </div>
    </section>
  );
}
