import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { logoutUser } from '../../services/api';

function FilterSection({ title, options, selected, onToggle }) {
  return (
    <div className="filter-section">
      <p className="filter-title">{title}</p>
      <div className="filter-options">
        {options.map(opt => (
          <label key={opt} className={`filter-chip ${selected.includes(opt) ? 'active' : ''}`}>
            <input
              type="checkbox"
              checked={selected.includes(opt)}
              onChange={() => onToggle(opt)}
            />
            {opt}
          </label>
        ))}
      </div>
    </div>
  );
}

export default function Sidebar({ filters, onToggle, onClear, filterSections }) {
  const navigate = useNavigate();
  const activeFilterCount = Object.values(filters).flat().length;
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const email = user?.email ?? '';

  async function handleLogout() {
    await logoutUser();
    localStorage.removeItem('user');
    navigate('/');
  }

  return (
    <aside className="sidebar">

      <div className="sidebar-brand">DateNite</div>

      <nav className="sidebar-nav">
        <NavLink to="/home" className="sidebar-nav-link">Home</NavLink>
        <NavLink to="/favorites" className="sidebar-nav-link">Favorites</NavLink>
      </nav>

      <div className="sidebar-sep" />

      <div className="sidebar-filters">
        <div className="sidebar-filters-header">
          <p className="sidebar-filters-label">Filters</p>
          {activeFilterCount > 0 && (
            <button className="clear-btn" onClick={onClear}>Clear all</button>
          )}
        </div>
        {filterSections.map(section => (
          <FilterSection
            key={section.title}
            title={section.title}
            options={section.options}
            selected={filters[section.key] ?? []}
            onToggle={v => onToggle(section.key, v)}
          />
        ))}
      </div>

      <div className="sidebar-footer">
        <NavLink to="/profile" className="sidebar-profile-link">
          <div className="sidebar-avatar">{email.charAt(0).toUpperCase()}</div>
          <span className="sidebar-email">{email}</span>
        </NavLink>
        {import.meta.env.DEV && (
          <NavLink to="/dev" className="sidebar-footer-link">Dev Tools</NavLink>
        )}
        <button className="sidebar-logout-btn" onClick={handleLogout}>Log Out</button>
      </div>

    </aside>
  );
}
