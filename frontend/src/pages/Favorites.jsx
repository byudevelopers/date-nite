import React, { useEffect, useState } from 'react';
import DateCard from './components/DateCard';
import { getDates } from '../services/api';

// Helper to capitalize first letter
function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

async function fetchUserInfo() {
  try {
    const res = await fetch('http://localhost:3000/users/me', {
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Not authenticated');
    const { user } = await res.json();
    return user;
  } catch (e) {
    return null;
  }
}

function Favorites() {
  const [user, setUser] = useState(null);
  const [dates, setDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      const userInfo = await fetchUserInfo();
      if (!userInfo) {
        setError('Could not load user info.');
        setLoading(false);
        return;
      }
      setUser(userInfo);
      const datesRes = await getDates();
      if (!datesRes.success) {
        setError('Could not load dates.');
        setLoading(false);
        return;
      }
      setDates(datesRes.data);
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!user) return <div>User not found.</div>;

  // Extract username from email
  const email = user.email || '';
  const username = capitalize(email.split('@')[0]);
  const favoriteIds = user.favorites || [];
  const favoriteDates = dates.filter(date => favoriteIds.includes(date.id));

  return (
    <div className="favorites-page">
      <h2 style={{ marginBottom: '1.5rem' }}>{username}'s Favorites</h2>
      {favoriteDates.length === 0 ? (
        <div>No favorites yet.</div>
      ) : (
        <div className="date-list">
          {favoriteDates.map(date => (
            <DateCard key={date.id} date={date} onClick={() => {}} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Favorites;