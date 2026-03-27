import React, { useState, useRef, useEffect } from 'react';

export function StarRating({ rating }) {
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={i <= Math.round(rating) ? 'star filled' : 'star'}>★</span>
      ))}
      <span className="rating-num">{rating?.toFixed(1)}</span>
    </div>
  );
}

export default function DateCard({ date, onClick, isSaved, onSave }) {
  const [expanded, setExpanded] = useState(false);
  const [isClamped, setIsClamped] = useState(false);
  const descRef = useRef(null);
  const isVenue = date.type === 'venue';

  useEffect(() => {
    const el = descRef.current;
    if (el) {
      setIsClamped(el.scrollHeight > el.clientHeight);
    }
  }, [date.description]);

  const hasRatings = date.rating_count > 0;
  const isFirstDateFriendly = hasRatings && date.first_date_count > date.rating_count / 2;

  return (
    <div className="date-card" onClick={() => onClick(date)}>
      <div className="card-body">

        {/* Title row */}
        <div className="card-header-row">
          <div className="card-title-group">
            <span className="card-icon-inline">{date.icon || (isVenue ? '📍' : '🏠')}</span>
            <h3 className="card-title">{date.name}</h3>
          </div>
          {onSave && (
            <button
              className={`card-save-btn ${isSaved ? 'saved' : ''}`}
              onClick={e => { e.stopPropagation(); onSave(date.id); }}
              aria-label={isSaved ? 'Unsave' : 'Save'}
            >
              {isSaved ? '♥' : '♡'}
            </button>
          )}
        </div>

        {/* Description + read more */}
        <p ref={descRef} className={`card-description ${expanded ? 'expanded' : ''}`}>
          {date.description}
        </p>
        {(isClamped || expanded) && (
          <button
            className="card-read-more"
            onClick={e => { e.stopPropagation(); setExpanded(v => !v); }}
          >
            {expanded ? 'read less' : 'read more'}
          </button>
        )}

        {/* Badge row */}
        <div className="card-badges">
          <span className={`card-badge ${isVenue ? 'card-badge--venue' : 'card-badge--home'}`}>
            {isVenue ? '📍 Venue' : '🏠 At-home'}
          </span>

          {date.avg_cost > 0 && (
            <span className="card-badge card-badge--stat">
              ${Math.round(date.avg_cost)}
            </span>
          )}

          {hasRatings && (
            <span className="card-badge card-badge--stat">
              {date.avg_rating?.toFixed(1)} ★ &middot; {date.rating_count} {date.rating_count === 1 ? 'rating' : 'ratings'}
            </span>
          )}

          {hasRatings && (
            <span className="card-badge card-badge--recommend">
              {date.percent_recommended}% recommend
            </span>
          )}

          {isFirstDateFriendly && (
            <span className="card-badge card-badge--first-date">
              🎯 Great for first dates
            </span>
          )}
        </div>

      </div>
    </div>
  );
}
