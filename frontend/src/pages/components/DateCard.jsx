import React from 'react';

function StarRating({ rating }) {
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={i <= Math.round(rating) ? 'star filled' : 'star'}>★</span>
      ))}
      <span className="rating-num">{rating?.toFixed(1)}</span>
    </div>
  );
}

export { StarRating };

export default function DateCard({ date, onClick }) {
  const isVenue = date.type === 'venue';
  const typeEmoji = isVenue ? '📍' : '🏠';

  return (
    <div className="date-card" onClick={() => onClick(date)}>
      <div className="card-left">
        <div className="card-icon">{date.icon || typeEmoji}</div>
      </div>
      <div className="card-body">
        <div className="card-top-row">
          <h3 className="card-title">{date.name}</h3>
          <span className="card-cost">{date.avg_cost ? `$${date.avg_cost}` : 'Free'}</span>
        </div>
        <p className="card-description">{date.description}</p>
        <div className="card-bottom-row">
          <div className="card-tags">
            {date.recommended_group && (
              <span className="tag">#{date.recommended_group}</span>
            )}
          </div>
          <div className="card-meta-right">
            <StarRating rating={date.avg_rating ?? 0} />
            <span className="card-type-badge">{isVenue ? 'Venue' : 'At-home'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}