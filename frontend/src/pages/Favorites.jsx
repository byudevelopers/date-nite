import React, { useState, useEffect } from 'react';
import DateCard, { StarRating } from './components/DateCard';
import Sidebar from './components/Sidebar';
import { getFavorites, removeFavorite, addFavorite } from '../services/api';

const FILTER_SECTIONS = [
  { title: 'Date Type', key: 'type', options: ['Venue', 'At-home'] },
  { title: 'Cost', key: 'cost', options: ['Free', 'Under $10', '$10–$25', '$25–$50', '$50+'] },
];

function DateInfoModal({ date, onClose }) {
  if (!date) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-type-badge">
          {date.type === 'venue' ? '📍 Venue' : '🏠 At-home'}
        </div>
        <h2 className="modal-title">{date.name}</h2>
        <StarRating rating={date.avg_rating ?? 0} />
        <p className="modal-description">{date.description}</p>
        <div className="modal-meta">
          <div className="meta-item">
            <span className="meta-label">Cost</span>
            <span className="meta-value">{date.avg_cost ? `$${date.avg_cost}` : 'Free'}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Group</span>
            <span className="meta-value">{date.recommended_group ?? '—'}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Location</span>
            <span className="meta-value">{date.location ?? '—'}</span>
          </div>
        </div>
        <p className="modal-placeholder-note">Full reviews & ratings coming soon ✨</p>
      </div>
    </div>
  );
}

export default function Favorites() {
  const [dates, setDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [filters, setFilters] = useState({ type: [], cost: [] });
  const [sort, setSort] = useState('top_rated');
  const [savedIds, setSavedIds] = useState(new Set());

  useEffect(() => {
    async function fetchFavorites() {
      setLoading(true);
      setError(null);
      const result = await getFavorites();
      if (result.success && result.data?.favorites) {
        setDates(result.data.favorites);
        setSavedIds(new Set(result.data.favorites.map(d => d.id)));
      } else {
        setError(result.error || 'Could not load favorites.');
      }
      setLoading(false);
    }
    fetchFavorites();
  }, []);

  function toggleFilter(category, value) {
    setFilters(prev => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter(v => v !== value)
        : [...prev[category], value],
    }));
  }

  function clearFilters() {
    setFilters({ type: [], cost: [] });
  }

  async function handleSave(dateId) {
    const isCurrentlySaved = savedIds.has(dateId);
    setSavedIds(prev => {
      const next = new Set(prev);
      isCurrentlySaved ? next.delete(dateId) : next.add(dateId);
      return next;
    });
    setDates(prev => prev.filter(d => d.id !== dateId));
    
    const result = isCurrentlySaved ? await removeFavorite(dateId) : await addFavorite(dateId);
    if (!result.success) {
      // Revert on failure
      setSavedIds(prev => {
        const next = new Set(prev);
        isCurrentlySaved ? next.add(dateId) : next.delete(dateId);
        return next;
      });
      setDates(prev => [...prev].sort((a, b) => a.id.localeCompare(b.id)));
      setError('Failed to update favorites. Please try again.');
    }
  }

  const filtered = dates.filter(d => {
    if (filters.type.length) {
      const typeMap = { 'Venue': 'venue', 'At-home': 'non-venue' };
      if (!filters.type.some(t => typeMap[t] === d.type)) return false;
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'top_rated')     return (b.avg_rating ?? 0) - (a.avg_rating ?? 0);
    if (sort === 'most_reviewed') return (b.rating_count ?? 0) - (a.rating_count ?? 0);
    if (sort === 'newest_activity') {
      if (!a.latest_rating_at && !b.latest_rating_at) return 0;
      if (!a.latest_rating_at) return 1;
      if (!b.latest_rating_at) return -1;
      return new Date(b.latest_rating_at) - new Date(a.latest_rating_at);
    }
    return 0;
  });

  return (
    <div className="app-shell">
      <Sidebar
        filters={filters}
        onToggle={toggleFilter}
        onClear={clearFilters}
        filterSections={FILTER_SECTIONS}
        sort={sort}
        onSort={setSort}
      />
      <div className="app-right">
        <header className="app-header">
          <span className="app-header-title">Favorites</span>
        </header>
        <div className="app-content">
          <div className="favorites-main">
            <main className="cards-area">
              <div className="cards-inner">
                {loading ? (
                  <div className="empty-state"><p>Loading favorites...</p></div>
                ) : error ? (
                  <div className="empty-state">
                    <p>{error}</p>
                    <button
                      onClick={() => {
                        setLoading(true);
                        setError(null);
                      }}
                      style={{ marginTop: '1rem', padding: '0.5rem 1rem', cursor: 'pointer' }}
                    >
                      Retry
                    </button>
                  </div>
                ) : dates.length === 0 ? (
                  <div className="empty-state">
                    <p>No favorites yet. Start exploring and save your favorite date ideas!</p>
                  </div>
                ) : (
                  <>
                    <div className="results-header">
                      <span className="results-count">
                        {sorted.length} favorite{sorted.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    {sorted.length === 0 ? (
                      <p className="no-results-text">No favorites match your filters.</p>
                    ) : (
                      <div className="cards-grid">
                        {sorted.map(date => (
                          <DateCard
                            key={date.id}
                            date={date}
                            onClick={setSelectedDate}
                            isSaved={savedIds.has(date.id)}
                            onSave={handleSave}
                          />
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </main>
          </div>

          <DateInfoModal date={selectedDate} onClose={() => setSelectedDate(null)} />
        </div>
      </div>
    </div>
  );
}