import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createDate } from '../services/api';
import '../styles/create-date.css';

const ICONS = ['🍕', '🎬', '🏔️', '🎨', '🎳', '🧁', '🎭', '🌿', '🎵', '🏖️', '🍣', '🎮', '🚴', '🌄', '📅'];

export default function CreateDate() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    type: 'venue',
    description: '',
    location: '',
    avg_cost: '',
    recommended_group: '',
    icon: '📅',
    group_size: '',
  });
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
      navigate('/home');
    } else {
      setError(result.error || 'Failed to create date. Is the backend running?');
    }
  }

  return (
    <div className="create-date-page">
      <div className="create-date-card">
        <h1>Submit a Date Idea</h1>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name *</label>
            <input
              id="name"
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
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
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
              <label htmlFor="location">Location</label>
              <input
                id="location"
                name="location"
                className="form-control"
                placeholder="e.g. Provo, UT"
                value={form.location}
                onChange={handleChange}
              />
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="avg_cost">Avg Cost ($)</label>
              <input
                id="avg_cost"
                name="avg_cost"
                type="number"
                min="0"
                className="form-control"
                placeholder="0"
                value={form.avg_cost}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="recommended_group">Recommended Group</label>
              <select
                id="recommended_group"
                name="recommended_group"
                className="form-control"
                value={form.recommended_group}
                onChange={handleChange}
              >
                <option value="">Select...</option>
                <option value="couple">Couple</option>
                <option value="double">Double date</option>
                <option value="group">Group</option>
                <option value="any">Any</option>
              </select>
            </div>
          </div>

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
            <button type="button" className="cancel-btn" onClick={() => navigate('/home')}>
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
