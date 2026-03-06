// Date entity interface
export interface Date {
  id: string;
  type: 'venue' | 'non-venue';
  name: string;                    // For venue: "Business Name (Full Address)"
  location?: string;               // Location information
  google_place_id?: string;        // Google Place ID (venue dates only)
  icon?: string;                   // Auto-generated emoji
  description?: string;            // From Google Places for venues
  avg_cost?: number;               // Calculated from user review submissions
  avg_rating?: number;             // Calculated from user review submissions
  recommended_group?: string;      // Calculated from review group_size field (single/double/triple+)
  group_size?: string;             // Group size information
}

// Google Places search result
export interface GooglePlace {
  place_id: string;                // Google Place ID
  name: string;                    // Business name
  formatted_address: string;       // Full formatted address
  vicinity?: string;               // Simplified address
  rating?: number;                 // Google rating (not stored in our DB)
  price_level?: number;            // Google price level 0-4 (not stored in our DB)
  types: string[];                 // Place types (e.g., ["restaurant", "food"])
  editorial_summary?: {
    overview?: string;             // Editorial description
  };
  opening_hours?: {
    open_now?: boolean;
  };
}

// Google Places search response
export interface PlacesSearchResponseDTO {
  places: GooglePlace[];
  status: string;
}

// Create date input DTO
export interface CreateDateDTO {
  type: 'venue' | 'non-venue';     // Required
  name: string;                     // Required: full name with address for venues
  google_place_id?: string;         // Required for venue, omitted for non-venue
}

// Create date response DTO
export interface CreateDateResponseDTO {
  date: Date;
}

// Error codes
export type DateErrorCode =
  | 'VALIDATION_ERROR'
  | 'INVALID_TYPE'
  | 'PLACE_ID_REQUIRED'
  | 'PLACE_NOT_FOUND'
  | 'PLACES_API_ERROR'
  | 'DATE_CREATION_FAILED';
