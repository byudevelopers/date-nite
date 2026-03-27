import React, { useState, useEffect } from 'react';
import DateCard, { StarRating } from './components/DateCard';
import SearchBar from './components/SearchBar';
import Sidebar from './components/Sidebar';
import { getDates } from '../services/api';

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

  useEffect(() => {
    async function fetchDates() {
      const result = await getDates();
      if (result.success) {
        setDates(result.data);
      } else {
        setError(result.error);
      }
      setLoading(false);
    }
    fetchDates();
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

  const filtered = dates.filter(d => {
    if (search && !d.name.toLowerCase().includes(search.toLowerCase()) &&
        !d.description?.toLowerCase().includes(search.toLowerCase())) return false;
    if (filters.type.length) {
      const typeMap = { 'Venue': 'venue', 'At-home': 'non-venue' };
      if (!filters.type.some(t => typeMap[t] === d.type)) return false;
    }
    return true;
  });

  return (
    <div className="home-layout">
      <Sidebar
        filters={filters}
        onToggle={toggleFilter}
        onClear={clearFilters}
        filterSections={FILTER_SECTIONS}
      />

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
                    {filtered.length} date{filtered.length !== 1 ? 's' : ''} found
                  </span>
                </div>
                {filtered.length === 0 ? (
                  <div className="empty-state">
                    <p>No dates match your filters.</p>
                    <button onClick={clearFilters} className="clear-btn-lg">Clear filters</button>
                  </div>
                ) : (
                  <div className="cards-grid">
                    {filtered.map(date => (
                      <DateCard key={date.id} date={date} onClick={setSelectedDate} />
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
  );
}