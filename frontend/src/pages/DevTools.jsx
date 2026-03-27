import React, { useState } from 'react';
import { checkHealth } from '../services/api';

// ── Schema Reference Data ────────────────────────────
const SCHEMA = [
  {
    table: 'users',
    description: 'Registered user profiles, linked to Supabase Auth',
    columns: [
      { name: 'id',        type: 'uuid',     notes: 'PK · references auth.users(id)' },
      { name: 'email',     type: 'text',     notes: 'unique · not null' },
      { name: 'favorites', type: 'uuid[]',   notes: 'array of date ids' },
    ],
  },
  {
    table: 'dates',
    description: 'Community-submitted date ideas',
    columns: [
      { name: 'id',                type: 'uuid',    notes: 'PK' },
      { name: 'type',              type: 'text',    notes: "'venue' | 'non-venue'" },
      { name: 'name',              type: 'text',    notes: '' },
      { name: 'location',          type: 'text',    notes: 'nullable' },
      { name: 'avg_cost',          type: 'numeric', notes: 'nullable' },
      { name: 'recommended_group', type: 'text',    notes: 'nullable' },
      { name: 'avg_rating',        type: 'numeric', notes: 'nullable' },
      { name: 'group_size',        type: 'text',    notes: 'nullable' },
      { name: 'icon',              type: 'text',    notes: 'emoji or url' },
      { name: 'description',       type: 'text',    notes: '' },
    ],
  },
  {
    table: 'ratings',
    description: 'User ratings submitted for a date idea',
    columns: [
      { name: 'id',            type: 'uuid',    notes: 'PK' },
      { name: 'user_id',       type: 'uuid',    notes: 'FK → users(id)' },
      { name: 'date_id',       type: 'uuid',    notes: 'FK → dates(id)' },
      { name: 'romance_level', type: 'text',    notes: "'casual' | 'romantic'" },
      { name: 'group_size',    type: 'text',    notes: "'single' | 'double' | 'group'" },
      { name: 'cost',          type: 'numeric', notes: 'user-reported cost' },
      { name: 'good_bad',      type: 'text',    notes: "'good' | 'bad'" },
      { name: 'first_date',    type: 'boolean', notes: '' },
      { name: 'review',        type: 'text',    notes: 'nullable' },
    ],
  },
];

// ── API Routes Reference Data ────────────────────────
const ROUTES = [
  { method: 'GET',  path: '/health',        auth: false, description: 'Backend health check' },
  { method: 'GET',  path: '/dates',         auth: false, description: 'Get all date ideas' },
  { method: 'POST', path: '/users',         auth: false, description: 'Register a new user' },
  { method: 'POST', path: '/users/login',   auth: false, description: 'Login, returns JWT' },
  { method: 'POST', path: '/users/logout',  auth: true,  description: 'Logout (client-side JWT drop)' },
  { method: 'GET',  path: '/users/me',      auth: true,  description: 'Get current user from JWT' },
];

const METHOD_COLORS = {
  GET:  { bg: '#e8f5e9', color: '#2e7d32' },
  POST: { bg: '#fff3e0', color: '#e65100' },
  PUT:  { bg: '#e3f2fd', color: '#1565c0' },
  DELETE: { bg: '#fce4ec', color: '#b71c1c' },
};

// ── Sub-components ───────────────────────────────────
function SectionHeader({ title, description }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-primary)', fontFamily: 'var(--font-serif)' }}>
        {title}
      </h2>
      {description && (
        <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '4px', fontFamily: 'var(--font-sans)' }}>
          {description}
        </p>
      )}
    </div>
  );
}

function Card({ children, style }) {
  return (
    <div style={{
      background: 'var(--color-bg-surface)',
      border: '2px solid var(--color-border)',
      borderRadius: '14px',
      padding: '24px',
      ...style,
    }}>
      {children}
    </div>
  );
}

// ── Section 1: Health Check ──────────────────────────
function HealthSection() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleCheck() {
    setLoading(true);
    setStatus(null);
    const result = await checkHealth();
    setStatus(result);
    setLoading(false);
  }

  const isHealthy = status?.success && status?.data?.status === 'healthy';

  return (
    <Card>
      <SectionHeader
        title="Backend Health"
        description="Pings GET /health and displays the response."
      />
      <button
        onClick={handleCheck}
        disabled={loading}
        style={{
          padding: '10px 20px',
          background: loading ? 'var(--color-border)' : 'var(--color-text-strong)',
          color: 'var(--color-text-on-dark)',
          border: 'none',
          borderRadius: '10px',
          fontFamily: 'var(--font-serif)',
          fontSize: '14px',
          cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'background 0.2s',
        }}
      >
        {loading ? 'Checking...' : 'Check Backend'}
      </button>

      {status && (
        <div style={{
          marginTop: '16px',
          padding: '16px',
          borderRadius: '10px',
          background: isHealthy ? '#e8f5e9' : '#fce4ec',
          border: `1px solid ${isHealthy ? '#a5d6a7' : '#ef9a9a'}`,
        }}>
          {isHealthy ? (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-sans)', fontSize: '13px' }}>
              <tbody>
                {[
                  ['Status',    status.data.status],
                  ['Service',   status.data.service],
                  ['Version',   status.data.version],
                  ['Uptime',    `${Math.floor(status.data.uptime)}s`],
                  ['Timestamp', new Date(status.data.timestamp).toLocaleTimeString()],
                ].map(([label, value]) => (
                  <tr key={label}>
                    <td style={{ padding: '4px 12px 4px 0', color: 'var(--color-text-muted)', width: '100px' }}>{label}</td>
                    <td style={{ padding: '4px 0', color: 'var(--color-text-strong)', fontWeight: 600 }}>{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ color: '#b71c1c', fontSize: '13px', margin: 0 }}>
              ✕ Backend unreachable — {status.error}
            </p>
          )}
        </div>
      )}
    </Card>
  );
}

// ── Section 2: Route Explorer ────────────────────────
function RouteExplorer() {
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState({});

  async function testRoute(route) {
    if (route.auth) {
      setResponses(prev => ({ ...prev, [route.path]: { error: 'This route requires auth — add your JWT to localStorage first.' } }));
      return;
    }
    if (route.method !== 'GET') {
      setResponses(prev => ({ ...prev, [route.path]: { error: 'Only GET routes can be tested here without a request body.' } }));
      return;
    }

    setLoading(prev => ({ ...prev, [route.path]: true }));
    try {
      const res = await fetch(`http://localhost:3000${route.path}`);
      const data = await res.json();
      setResponses(prev => ({ ...prev, [route.path]: { status: res.status, data } }));
    } catch (e) {
      setResponses(prev => ({ ...prev, [route.path]: { error: e.message } }));
    }
    setLoading(prev => ({ ...prev, [route.path]: false }));
  }

  return (
    <Card>
      <SectionHeader
        title="API Route Explorer"
        description="All known backend routes. GET routes without auth can be tested inline."
      />
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-sans)', fontSize: '13px' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
            {['Method', 'Path', 'Auth', 'Description', ''].map(h => (
              <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--color-text-muted)', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', fontSize: '11px' }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROUTES.map(route => {
            const mc = METHOD_COLORS[route.method] || {};
            const resp = responses[route.path];
            return (
              <React.Fragment key={route.path}>
                <tr style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{ background: mc.bg, color: mc.color, padding: '2px 8px', borderRadius: '6px', fontWeight: 700, fontSize: '11px' }}>
                      {route.method}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px', fontFamily: 'monospace', color: 'var(--color-text-strong)' }}>
                    {route.path}
                  </td>
                  <td style={{ padding: '10px 12px', color: route.auth ? 'var(--color-accent)' : 'var(--color-text-muted)' }}>
                    {route.auth ? '🔒 Yes' : '—'}
                  </td>
                  <td style={{ padding: '10px 12px', color: 'var(--color-text-body)' }}>
                    {route.description}
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <button
                      onClick={() => testRoute(route)}
                      disabled={loading[route.path]}
                      style={{
                        padding: '4px 12px',
                        background: 'var(--color-bg-page)',
                        border: '1px solid var(--color-border-input)',
                        borderRadius: '6px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        color: 'var(--color-text-body)',
                        fontFamily: 'var(--font-sans)',
                      }}
                    >
                      {loading[route.path] ? '...' : 'Test'}
                    </button>
                  </td>
                </tr>
                {resp && (
                  <tr>
                    <td colSpan={5} style={{ padding: '0 12px 12px 12px' }}>
                      <pre style={{
                        background: 'var(--color-bg-page)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '8px',
                        padding: '12px',
                        fontSize: '12px',
                        overflowX: 'auto',
                        color: resp.error ? 'var(--color-accent)' : 'var(--color-text-strong)',
                        margin: 0,
                        maxHeight: '200px',
                        overflowY: 'auto',
                      }}>
                        {resp.error
                          ? `Error: ${resp.error}`
                          : `HTTP ${resp.status}\n\n${JSON.stringify(resp.data, null, 2)}`
                        }
                      </pre>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </Card>
  );
}

// ── Section 3: Schema Viewer ─────────────────────────
function SchemaViewer() {
  const [open, setOpen] = useState('dates');

  return (
    <Card>
      <SectionHeader
        title="Database Schema"
        description="Reference for all Supabase tables. No live data — static from supabase_schema.md."
      />
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {SCHEMA.map(s => (
          <button
            key={s.table}
            onClick={() => setOpen(s.table)}
            style={{
              padding: '6px 16px',
              borderRadius: '8px',
              border: '2px solid',
              borderColor: open === s.table ? 'var(--color-accent)' : 'var(--color-border)',
              background: open === s.table ? 'var(--color-accent-subtle)' : 'var(--color-bg-surface)',
              color: open === s.table ? 'var(--color-accent)' : 'var(--color-text-body)',
              fontFamily: 'var(--font-serif)',
              fontSize: '13px',
              fontWeight: open === s.table ? 700 : 400,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {s.table}
          </button>
        ))}
      </div>

      {SCHEMA.filter(s => s.table === open).map(s => (
        <div key={s.table}>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '12px', fontFamily: 'var(--font-sans)' }}>
            {s.description}
          </p>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-sans)', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                {['Column', 'Type', 'Notes'].map(h => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--color-text-muted)', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', fontSize: '11px' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {s.columns.map((col, i) => (
                <tr key={col.name} style={{ background: i % 2 === 0 ? 'transparent' : 'var(--color-bg-page)', borderBottom: '1px solid var(--color-border-subtle)' }}>
                  <td style={{ padding: '9px 12px', fontFamily: 'monospace', fontWeight: 600, color: 'var(--color-text-strong)' }}>
                    {col.name}
                  </td>
                  <td style={{ padding: '9px 12px', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
                    {col.type}
                  </td>
                  <td style={{ padding: '9px 12px', color: 'var(--color-text-secondary)' }}>
                    {col.notes || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </Card>
  );
}

// ── Page ─────────────────────────────────────────────
export default function DevTools() {
  return (
    <div style={{
      maxWidth: '900px',
      margin: '0 auto',
      padding: '32px 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      fontFamily: 'var(--font-sans)',
    }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-primary)', fontFamily: 'var(--font-serif)' }}>
          ⚙ Dev Tools
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '6px' }}>
          Only visible in development. Not linked from the main nav in production.
        </p>
      </div>
      <HealthSection />
      <RouteExplorer />
      <SchemaViewer />
    </div>
  );
}