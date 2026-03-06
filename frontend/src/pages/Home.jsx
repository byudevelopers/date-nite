import React, { useState, useEffect } from 'react';
import DateCard, { StarRating } from './components/DateCard';
import { getDates } from '../services/api';

const COST_RANGES = ['Free', 'Under $10', '$10–$25', '$25–$50', '$50+'];
const DATE_TYPES = ['Venue', 'At-home'];

function FilterSection({ title, options, selected, onToggle }) {
  return (
    <div className="filter-section">
      <h4 className="filter-title">{title}</h4>
      <div className="filter-options">
        {options.map(opt => (
          <label key={opt} className={`filter-chip ${selected.includes(opt) ? 'active' : ''}`}>
            <input type="checkbox" checked={selected.includes(opt)} onChange={() => onToggle(opt)} />
            {opt}
          </label>
        ))}
      </div>
    </div>
  );
}

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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [filters, setFilters] = useState({ cost: [], type: [] });

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
    setFilters({ cost: [], type: [] });
  }

  const activeFilterCount = Object.values(filters).flat().length;

  const filtered = dates.filter(d => {
    if (search && !d.name.toLowerCase().includes(search.toLowerCase()) && !d.description?.toLowerCase().includes(search.toLowerCase())) return false;
    if (filters.type.length) {
      const typeMap = { 'Venue': 'venue', 'At-home': 'non-venue' };
      if (!filters.type.some(t => typeMap[t] === d.type)) return false;
    }
    return true;
  });

  return (
    <div className="home-layout">
      {/* Search Bar */}
      <div className="search-bar-wrapper">
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search date ideas..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="search-input"
          />
          {search && <button className="search-clear" onClick={() => setSearch('')}>✕</button>}
        </div>
        <button className="filter-toggle-btn" onClick={() => setSidebarOpen(o => !o)}>
          <span>Filters</span>
          {activeFilterCount > 0 && <span className="filter-badge">{activeFilterCount}</span>}
          <span>{sidebarOpen ? '◀' : '▶'}</span>
        </button>
      </div>

      <div className="home-body">
        {/* Sidebar */}
        <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
          <div className="sidebar-header">
            <h3>Filters</h3>
            {activeFilterCount > 0 && (
              <button className="clear-btn" onClick={clearFilters}>Clear all</button>
            )}
          </div>
          <FilterSection title="Date Type" options={DATE_TYPES} selected={filters.type} onToggle={v => toggleFilter('type', v)} />
          <FilterSection title="Cost" options={COST_RANGES} selected={filters.cost} onToggle={v => toggleFilter('cost', v)} />
        </aside>

        {/* Main Content */}
        <main className="cards-area">
          {loading ? (
            <div className="empty-state"><p>Loading dates...</p></div>
          ) : error ? (
            <div className="empty-state"><p>Couldn't load dates. Is the backend running?</p></div>
          ) : (
            <>
              <div className="results-header">
                <span className="results-count">{filtered.length} date{filtered.length !== 1 ? 's' : ''} found</span>
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
        </main>
      </div>

      {/* Date Info Modal */}
      <DateInfoModal date={selectedDate} onClose={() => setSelectedDate(null)} />
    </div>
  );
}