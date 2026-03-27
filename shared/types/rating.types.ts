// Rating entity (matches database schema)
export interface Rating {
  id: string;
  user_id: string;
  date_id: string;
  romance_level: 'casual' | 'romantic';
  group_size: 'single' | 'double' | 'group';
  cost: number;
  good_bad: 'good' | 'bad';
  first_date: boolean;
  created_at: string; // ISO 8601 date string
}

// Request DTO for creating a rating
export interface CreateRatingDTO {
  date_id: string;
  romance_level: 'casual' | 'romantic';
  group_size: 'single' | 'double' | 'group';
  cost: number;
  good_bad: 'good' | 'bad';
  first_date: boolean;
}

// Response DTO for rating creation
export interface CreateRatingResponseDTO {
  rating: Rating;
}

// Response DTO for aggregate statistics
export interface RatingAveragesDTO {
  dateId: string;
  dateName: string;
  avgCost: number | null;
  avgRating: number; // Percentage 0-100
  totalRatings: number;
  goodCount: number;
  badCount: number;
  filters: {
    romance_level?: 'casual' | 'romantic';
    group_size?: 'single' | 'double' | 'group';
    first_date?: boolean;
  };
}

// Error codes
export type RatingErrorCode =
  | 'VALIDATION_ERROR'
  | 'DATE_NOT_FOUND'
  | 'DUPLICATE_RATING_COOLDOWN'
  | 'RATING_CREATION_FAILED'
  | 'INVALID_FILTERS';
