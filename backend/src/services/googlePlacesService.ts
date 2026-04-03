import type { GooglePlace, PlacesSearchResponseDTO } from "@shared/date.types";

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

if (!GOOGLE_PLACES_API_KEY) {
  throw new Error('GOOGLE_PLACES_API_KEY environment variable is required');
}

// Type assertion since we've checked it's defined
const API_KEY: string = GOOGLE_PLACES_API_KEY;

// Search Google Places (New Text Search API)
export async function searchGooglePlaces(
  query: string,
  location?: string
): Promise<PlacesSearchResponseDTO> {
  try {
    const url = 'https://places.googleapis.com/v1/places:searchText';

    // Combine query with location for better results
    const searchQuery = location ? `${query} in ${location}` : query;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': API_KEY,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.types,places.editorialSummary,places.rating,places.priceLevel'
      },
      body: JSON.stringify({ textQuery: searchQuery })
    });

    if (!response.ok) {
      throw new Error(`Google Places API error: ${response.status}`);
    }

    const data = await response.json();

    // Map new API response to our format
    const places: GooglePlace[] = (data.places || []).map((place: any) => ({
      place_id: place.id,
      name: place.displayName?.text || '',
      formatted_address: place.formattedAddress || '',
      types: place.types || [],
      editorial_summary: place.editorialSummary ? {
        overview: place.editorialSummary.text
      } : undefined,
      rating: place.rating,
      price_level: place.priceLevel
    }));

    return {
      places,
      status: places.length > 0 ? 'OK' : 'ZERO_RESULTS'
    };
  } catch (error: any) {
    console.error('Google Places search error:', error.message);
    throw new Error('PLACES_API_ERROR');
  }
}

// Fetch single place details by Place ID (uses new Places API v2)
export async function fetchGooglePlace(placeId: string): Promise<GooglePlace> {
  try {
    const url = `https://places.googleapis.com/v1/places/${placeId}`;

    const response = await fetch(url, {
      headers: {
        'X-Goog-Api-Key': API_KEY,
        'X-Goog-FieldMask': 'id,displayName,formattedAddress,types,editorialSummary,rating,priceLevel',
      },
    });

    if (response.status === 404) {
      throw new Error('PLACE_NOT_FOUND');
    }

    if (!response.ok) {
      throw new Error(`Google Places API error: ${response.status}`);
    }

    const place = await response.json();

    return {
      place_id: place.id,
      name: place.displayName?.text || '',
      formatted_address: place.formattedAddress || '',
      types: place.types || [],
      ...(place.editorialSummary ? { editorial_summary: { overview: place.editorialSummary.text as string } } : {}),
      rating: place.rating,
      price_level: place.priceLevel,
    };
  } catch (error: any) {
    if (error.message === 'PLACE_NOT_FOUND') {
      throw error;
    }
    throw new Error('PLACES_API_ERROR');
  }
}
