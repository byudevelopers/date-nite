import React from 'react';

function FilterSection({ title, options, selected, onToggle }) {
  return (
    <div className="filter-section">
      <h4 className="filter-title">{title}</h4>
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

export default function Sidebar({ isOpen, onClose, filters, onToggle, onClear, filterSections }) {
  const activeFilterCount = Object.values(filters).flat().length;

  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <h3>Filters</h3>
        <div className="sidebar-header-actions">
          {activeFilterCount > 0 && (
            <button className="clear-btn" onClick={onClear}>Clear all</button>
          )}
          <button className="sidebar-collapse-btn" onClick={onClose}>◀</button>
        </div>
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
    </aside>
  );
}