// API base configuration
const API_BASE_URL = 'http://localhost:3000';

/**
 * Generic fetch wrapper with error handling
 */
async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      credentials: 'include', // Include cookies in all requests
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    // Try to parse JSON response (both success and error cases)
    const data = await response.json();

    // Check if response is ok
    if (!response.ok) {
      // Return the backend error message if available
      return {
        success: false,
        error: data.message || data.error || `HTTP error! status: ${response.status}`
      };
    }

    return { success: true, data };
  } catch (error) {
    // Network error or fetch failed
    return {
      success: false,
      error: error.message || 'Network request failed'
    };
  }
}

/**
 * Health check API call
 */
export async function checkHealth() {
  return apiFetch('/health');
}

/**
 * Login user
 */
export async function loginUser(email, password) {
  return apiFetch('/users/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

/**
 * Register user
 */
export async function registerUser(email, password) {
  return apiFetch('/users', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

/**
 * Logout user
 */
export async function logoutUser() {
  return apiFetch('/users/logout', {
    method: 'POST',
  });
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser() {
  return apiFetch('/users/me');
}

/**
 * Get saved/favorite dates for current user
 */
export async function getFavorites() {
  return apiFetch('/users/favorites');
}

/**
 * Save a date to favorites
 */
export async function addFavorite(dateId) {
  return apiFetch('/users/favorites/add', {
    method: 'POST',
    body: JSON.stringify({ dateId }),
  });
}

/**
 * Remove a date from favorites
 */
export async function removeFavorite(dateId) {
  return apiFetch('/users/favorites/remove', {
    method: 'DELETE',
    body: JSON.stringify({ dateId }),
  });
}

/**
 * Get all date ideas
 */
export async function getDates() {
  return apiFetch('/dates');
}

/**
 * Create a new date idea
 */
export async function createDate(dateData) {
  return apiFetch('/dates/create', {
    method: 'POST',
    body: JSON.stringify(dateData),
  });
}

/**
 * Search Google Places
 */
export async function searchPlaces(query, location) {
  const params = new URLSearchParams({ query });
  if (location) params.set('location', location);
  return apiFetch(`/dates/search-places?${params}`);
}

/**
 * Submit a rating for a date
 */
export async function createRating(ratingData) {
  return apiFetch('/ratings', {
    method: 'POST',
    body: JSON.stringify(ratingData),
  });
}

/**
 * Get aggregate rating stats for a date, with optional filters
 */
export async function getRatingAverages(dateId, filters = {}) {
  const params = new URLSearchParams();
  if (filters.romance_level) params.set('romance_level', filters.romance_level);
  if (filters.group_size)    params.set('group_size', filters.group_size);
  if (filters.first_date != null) params.set('first_date', filters.first_date);
  const qs = params.toString();
  return apiFetch(`/ratings/averages/${dateId}${qs ? `?${qs}` : ''}`);
}

// Get all dates
export async function getDates() {
  // Fetch from /dates, expect an array of date objects
  const res = await fetch(`${API_BASE_URL}/dates`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });
  try {
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.message || data.error || `HTTP error! status: ${res.status}` };
    }
    // If the response is an array, wrap it in { success: true, data }
    if (Array.isArray(data)) {
      return { success: true, data };
    }
    // If the response is an object with a data property, use that
    if (data && Array.isArray(data.data)) {
      return { success: true, data: data.data };
    }
    // Otherwise, error
    return { success: false, error: 'Unexpected response format from /dates' };
  } catch (e) {
    return { success: false, error: 'Failed to parse /dates response' };
  }
}