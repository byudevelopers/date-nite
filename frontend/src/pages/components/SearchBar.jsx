import React from 'react';

export default function SearchBar({ value, onChange, onClear, placeholder = 'Search...' }) {
  return (
    <div className="search-bar-wrapper">
      <div className="search-bar">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="search-input"
        />
        {value && (
          <button className="search-clear" onClick={onClear}>✕</button>
        )}
      </div>
    </div>
  );
}