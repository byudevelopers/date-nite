import type { GooglePlace, PlacesSearchResponseDTO } from "@shared/date.types";

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

if (!GOOGLE_PLACES_API_KEY) {
  throw new Error('GOOGLE_PLACES_API_KEY environment variable is required');
}

// Search Google Places (Text Search)
export async function searchGooglePlaces(
  query: string,
  location?: string
): Promise<PlacesSearchResponseDTO> {
  try {
    const url = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json');

    // Combine query with location for better results
    const searchQuery = location ? `${query} in ${location}` : query;
    url.searchParams.append('query', searchQuery);
    url.searchParams.append('key', GOOGLE_PLACES_API_KEY);

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`Google Places API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      throw new Error(`Places API status: ${data.status}`);
    }

    return {
      places: data.results || [],
      status: data.status
    };
  } catch (error: any) {
    throw new Error('PLACES_API_ERROR');
  }
}

// Fetch single place details by Place ID
export async function fetchGooglePlace(placeId: string): Promise<GooglePlace> {
  try {
    const url = new URL('https://maps.googleapis.com/maps/api/place/details/json');
    url.searchParams.append('place_id', placeId);
    url.searchParams.append('fields', 'place_id,name,formatted_address,types,editorial_summary,rating,price_level');
    url.searchParams.append('key', GOOGLE_PLACES_API_KEY);

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`Google Places API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.status === 'NOT_FOUND' || data.status === 'INVALID_REQUEST') {
      throw new Error('PLACE_NOT_FOUND');
    }

    if (data.status !== 'OK') {
      throw new Error(`Places API status: ${data.status}`);
    }

    return data.result;
  } catch (error: any) {
    if (error.message === 'PLACE_NOT_FOUND') {
      throw error;
    }
    throw new Error('PLACES_API_ERROR');
  }
}
