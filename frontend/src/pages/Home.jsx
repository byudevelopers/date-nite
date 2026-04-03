import React, { useState, useEffect } from 'react';
import DateCard, { StarRating } from './components/DateCard';
import SearchBar from './components/SearchBar';
import Sidebar from './components/Sidebar';
import { getDates, getFavorites, addFavorite, removeFavorite, createDate } from '../services/api';

const ICONS = ['🍕', '🎬', '🏔️', '🎨', '🎳', '🧁', '🎭', '🌿', '🎵', '🏖️', '🍣', '🎮', '🚴', '🌄', '📅'];

const EMPTY_FORM = {
  name: '',
  type: 'non-venue',
  description: '',
  location: '',
  icon: '📅',
};

function CreateDateModal({ onClose, onCreated }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) {
      setError('Name is required.');
      return;
    }
    setSubmitting(true);
    const result = await createDate({
      ...form,
      avg_cost: form.avg_cost !== '' ? Number(form.avg_cost) : undefined,
    });
    setSubmitting(false);
    if (result.success) {
      onCreated();
    } else {
      setError(result.error || 'Failed to create date. Is the backend running?');
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card modal-card--create" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h2 className="modal-title">Submit a Date Idea</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="cd-name">Name *</label>
            <input
              id="cd-name"
              name="name"
              className="form-control"
              placeholder="e.g. Stargazing at Rock Canyon"
              value={form.name}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Type *</label>
            <div className="type-toggle">
              <button
                type="button"
                className={`type-btn${form.type === 'venue' ? ' active' : ''}`}
                onClick={() => setForm(prev => ({ ...prev, type: 'venue' }))}
              >
                📍 Venue
              </button>
              <button
                type="button"
                className={`type-btn${form.type === 'non-venue' ? ' active' : ''}`}
                onClick={() => setForm(prev => ({ ...prev, type: 'non-venue' }))}
              >
                🏠 At-home
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="cd-description">Description</label>
            <textarea
              id="cd-description"
              name="description"
              className="form-control"
              placeholder="Describe the date idea..."
              rows={3}
              value={form.description}
              onChange={handleChange}
            />
          </div>

          {form.type === 'venue' && (
            <div className="form-group">
              <label htmlFor="cd-location">Location</label>
              <input
                id="cd-location"
                name="location"
                className="form-control"
                placeholder="e.g. Provo, UT"
                value={form.location}
                onChange={handleChange}
              />
            </div>
          )}

          <div className="form-group">
            <label>Icon</label>
            <div className="icon-picker">
              {ICONS.map(icon => (
                <button
                  key={icon}
                  type="button"
                  className={`icon-btn${form.icon === icon ? ' active' : ''}`}
                  onClick={() => setForm(prev => ({ ...prev, icon }))}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="error">{error}</p>}

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Date'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

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

export default function Home() {
  const [dates, setDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [filters, setFilters] = useState({ type: [], cost: [] });
  const [sort, setSort] = useState('top_rated');
  const [savedIds, setSavedIds] = useState(new Set());
  const [showCreateModal, setShowCreateModal] = useState(false);

  async function fetchDates() {
    const result = await getDates();
    if (result.success) {
      setDates(result.data);
    } else {
      setError(result.error);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchDates();
  }, []);

  useEffect(() => {
    getFavorites().then(res => {
      if (res?.data?.favorites) {
        setSavedIds(new Set(res.data.favorites.map(d => d.id)));
      }
    });
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

  function matchesCost(date, costFilters) {
    if (costFilters.length === 0) return true;
    const cost = date.avg_cost;
    return costFilters.some(filter => {
      switch (filter) {
        case 'Free':
          return cost == null || cost === 0;
        case 'Under $10':
          return cost != null && cost < 10;
        case '$10–$25':
          return cost >= 10 && cost <= 25;
        case '$25–$50':
          return cost >= 25 && cost <= 50;
        case '$50+':
          return cost > 50;
        default:
          return false;
      }
    });
  }

  async function handleSave(dateId) {
    const isCurrentlySaved = savedIds.has(dateId);
    setSavedIds(prev => {
      const next = new Set(prev);
      isCurrentlySaved ? next.delete(dateId) : next.add(dateId);
      return next;
    });
    const result = isCurrentlySaved ? await removeFavorite(dateId) : await addFavorite(dateId);
    if (!result.success) {
      setSavedIds(prev => {
        const next = new Set(prev);
        isCurrentlySaved ? next.add(dateId) : next.delete(dateId);
        return next;
      });
    }
  }

  const filtered = dates.filter(d => {
    if (search && !d.name.toLowerCase().includes(search.toLowerCase()) &&
        !d.description?.toLowerCase().includes(search.toLowerCase())) return false;
    if (filters.type.length) {
      const typeMap = { 'Venue': 'venue', 'At-home': 'non-venue' };
      if (!filters.type.some(t => typeMap[t] === d.type)) return false;
    }
    if (filters.cost.length && !matchesCost(d, filters.cost)) return false;
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
          <span className="app-header-title">Home</span>
          <button className="header-create-btn" onClick={() => setShowCreateModal(true)}>+ New Date</button>
        </header>
        <div className="app-content">
          <div className="home-main">
            <SearchBar
              value={search}
              onChange={setSearch}
              onClear={() => setSearch('')}
              placeholder="Search date ideas..."
            />

            <main className="cards-area">
              <div className="cards-inner">
                {loading ? (
                  <div className="empty-state"><p>Loading dates...</p></div>
                ) : error ? (
                  <div className="empty-state"><p>Couldn't load dates. Is the backend running?</p></div>
                ) : (
                  <>
                    <div className="results-header">
                      <span className="results-count">
                        {sorted.length} date{sorted.length !== 1 ? 's' : ''} found
                      </span>
                    </div>
                    {sorted.length === 0 ? (
                      <p className="no-results-text">No dates match your filters.</p>
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
          {showCreateModal && (
            <CreateDateModal
              onClose={() => setShowCreateModal(false)}
              onCreated={() => { setShowCreateModal(false); fetchDates(); }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
