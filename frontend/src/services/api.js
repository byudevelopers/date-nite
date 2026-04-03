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