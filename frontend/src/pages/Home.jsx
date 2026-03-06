import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MOCK_DATES = [
  { id: 1, name: 'Stargazing at Rock Canyon', type: 'non-venue', cost: '$5', romance: 'romantic', groupSize: 'double', rating: 4.8, description: 'Head up the canyon with blankets and a star map. Stunning views of the valley below.', tags: ['outdoors', 'night', 'free'] },
  { id: 2, name: 'Board Game Café Night', type: 'venue', cost: '$20', romance: 'casual', groupSize: 'group', rating: 4.5, description: 'Pick from 200+ games, order drinks and snacks, and enjoy a cozy competitive evening.', tags: ['indoor', 'fun', 'group-friendly'] },
  { id: 3, name: 'Cook a New Cuisine Together', type: 'non-venue', cost: '$30', romance: 'romantic', groupSize: 'double', rating: 4.7, description: 'Pick a cuisine neither of you has made before. Thai, Ethiopian, Moroccan — go wild.', tags: ['at-home', 'food', 'creative'] },
  { id: 4, name: 'Farmers Market + Picnic', type: 'venue', cost: '$15', romance: 'casual', groupSize: 'double', rating: 4.6, description: 'Browse the Saturday market, grab fresh ingredients, and find a shady spot in the park.', tags: ['outdoors', 'food', 'morning'] },
  { id: 5, name: 'DIY Paint Night', type: 'non-venue', cost: '$25', romance: 'romantic', groupSize: 'double', rating: 4.3, description: 'Set up canvases, put on a playlist, and attempt to paint the same scene. Compare results.', tags: ['at-home', 'creative', 'cozy'] },
  { id: 6, name: 'Mini Golf Tournament', type: 'venue', cost: '$12', romance: 'casual', groupSize: 'group', rating: 4.4, description: 'Friendly competition, terrible puns about your shot, and someone always loses dramatically.', tags: ['outdoors', 'competitive', 'fun'] },
  { id: 7, name: 'Midnight Diner Crawl', type: 'venue', cost: '$35', romance: 'casual', groupSize: 'group', rating: 4.2, description: 'Hit three diners after midnight. Order something you\'ve never tried at each stop.', tags: ['night', 'food', 'adventure'] },
  { id: 8, name: 'Sunrise Hike', type: 'non-venue', cost: '$0', romance: 'romantic', groupSize: 'double', rating: 4.9, description: 'Leave before dawn, reach the summit just as the light breaks. Worth every early alarm.', tags: ['outdoors', 'morning', 'free'] },
  { id: 9, name: 'Pottery Studio Drop-in', type: 'venue', cost: '$40', romance: 'romantic', groupSize: 'double', rating: 4.6, description: 'No experience needed. You will both make terrible bowls and have an incredible time.', tags: ['indoor', 'creative', 'hands-on'] },
];

const COST_RANGES = ['Free', 'Under $10', '$10–$25', '$25–$50', '$50+'];
const DATE_TYPES = ['Venue', 'At-home'];

function StarRating({ rating }) {
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={i <= Math.round(rating) ? 'star filled' : 'star'}>★</span>
      ))}
      <span className="rating-num">{rating}</span>
    </div>
  );
}

function DateCard({ date, onClick }) {
  const typeEmoji = date.type === 'venue' ? '📍' : '🏠';
  return (
    <div className="date-card" onClick={() => onClick(date)}>
      <div className="card-left">
        <div className="card-icon">{typeEmoji}</div>
      </div>
      <div className="card-body">
        <div className="card-top-row">
          <h3 className="card-title">{date.name}</h3>
          <span className="card-cost">{date.cost}</span>
        </div>
        <p className="card-description">{date.description}</p>
        <div className="card-bottom-row">
          <div className="card-tags">
            {date.tags.map(tag => <span key={tag} className="tag">#{tag}</span>)}
          </div>
          <div className="card-meta-right">
            <StarRating rating={date.rating} />
            <span className="card-type-badge">{date.type === 'venue' ? 'Venue' : 'At-home'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

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
        <StarRating rating={date.rating} />
        <p className="modal-description">{date.description}</p>
        <div className="modal-meta">
          <div className="meta-item"><span className="meta-label">Cost</span><span className="meta-value">{date.cost}</span></div>
          <div className="meta-item"><span className="meta-label">Vibe</span><span className="meta-value">{date.romance}</span></div>
          <div className="meta-item"><span className="meta-label">Group</span><span className="meta-value">{date.groupSize}</span></div>
        </div>
        <div className="modal-tags">
          {date.tags.map(tag => <span key={tag} className="tag"># {tag}</span>)}
        </div>
        <p className="modal-placeholder-note">Full reviews & ratings coming soon ✨</p>
      </div>
    </div>
  );
}

export default function Home() {
  const [search, setSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [filters, setFilters] = useState({
    cost: [],
    type: [],
  });

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

  const filtered = MOCK_DATES.filter(d => {
    if (search && !d.name.toLowerCase().includes(search.toLowerCase()) && !d.description.toLowerCase().includes(search.toLowerCase())) return false;
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
        </main>
      </div>

      {/* Date Info Modal */}
      <DateInfoModal date={selectedDate} onClose={() => setSelectedDate(null)} />
    </div>
  );
}