// API base configuration
const API_BASE_URL = 'http://localhost:3000';

/**
 * Generic fetch wrapper with error handling
 */
async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    // Check if response is ok
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
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
