import {
  getDate,
  createRating,
  getRatingsByDateId,
  getRecentRatingByUser,
  updateDate
} from "../database";
import type {
  CreateRatingDTO,
  CreateRatingResponseDTO,
  RatingAveragesDTO,
  Rating
} from "@shared/rating.types";
import { v4 as uuidv4 } from "uuid";

/**
 * Create a new rating for a date idea
 */
export async function createRatingService(
  userId: string,
  ratingData: CreateRatingDTO
): Promise<CreateRatingResponseDTO> {
  const { date_id, romance_level, group_size, cost, good_bad, first_date } = ratingData;

  // Validate all required fields are present
  if (!date_id || !romance_level || !group_size || cost === undefined || !good_bad || first_date === undefined) {
    throw new Error('VALIDATION_ERROR');
  }

  // Validate enum values
  if (romance_level !== 'casual' && romance_level !== 'romantic') {
    throw new Error('VALIDATION_ERROR');
  }

  if (group_size !== 'single' && group_size !== 'double' && group_size !== 'group') {
    throw new Error('VALIDATION_ERROR');
  }

  if (good_bad !== 'good' && good_bad !== 'bad') {
    throw new Error('VALIDATION_ERROR');
  }

  // Validate cost is positive number
  if (typeof cost !== 'number' || cost < 0) {
    throw new Error('VALIDATION_ERROR');
  }

  // Check date exists
  const date = getDate(date_id);
  if (!date) {
    throw new Error('DATE_NOT_FOUND');
  }

  // Check for recent ratings (24-hour cooldown)
  const recentRating = getRecentRatingByUser(date_id, userId, 24);
  if (recentRating) {
    throw new Error('DUPLICATE_RATING_COOLDOWN');
  }

  // Generate UUID and create rating
  const ratingId = uuidv4();
  const created_at = new Date().toISOString();

  const newRating: Rating = {
    id: ratingId,
    user_id: userId,
    date_id,
    romance_level,
    group_size,
    cost,
    good_bad,
    first_date: first_date ? 1 : 0, // Convert boolean to 0/1 for SQLite
    created_at
  };

  const createdRating = createRating(newRating);
  if (!createdRating) {
    throw new Error('RATING_CREATION_FAILED');
  }

  // Recalculate and update dates table averages
  const allRatings = getRatingsByDateId(date_id);

  // Calculate avg_cost
  const totalCost = allRatings.reduce((sum, r) => sum + r.cost, 0);
  const avg_cost = allRatings.length > 0 ? totalCost / allRatings.length : null;

  // Calculate avg_rating (percentage of "good" ratings)
  const goodCount = allRatings.filter(r => r.good_bad === 'good').length;
  const avg_rating = allRatings.length > 0 ? (goodCount / allRatings.length) * 100 : null;

  // Update the date with new averages
  updateDate(date_id, { avg_cost, avg_rating });

  // Convert first_date back to boolean for response
  const responseRating: Rating = {
    ...createdRating,
    first_date: createdRating.first_date === 1
  };

  return { rating: responseRating };
}

/**
 * Get aggregate rating statistics for a date, with optional filters
 */
export async function getAveragesForDate(
  dateId: string,
  filters?: {
    romance_level?: 'casual' | 'romantic';
    group_size?: 'single' | 'double' | 'group';
    first_date?: boolean;
  }
): Promise<RatingAveragesDTO> {
  // Validate date exists
  const date = getDate(dateId);
  if (!date) {
    throw new Error('DATE_NOT_FOUND');
  }

  // Get all ratings for this date
  let ratings = getRatingsByDateId(dateId);

  // Apply filters
  if (filters) {
    if (filters.romance_level) {
      ratings = ratings.filter(r => r.romance_level === filters.romance_level);
    }
    if (filters.group_size) {
      ratings = ratings.filter(r => r.group_size === filters.group_size);
    }
    if (filters.first_date !== undefined) {
      const firstDateValue = filters.first_date ? 1 : 0;
      ratings = ratings.filter(r => r.first_date === firstDateValue);
    }
  }

  // Calculate aggregates
  const goodCount = ratings.filter(r => r.good_bad === 'good').length;
  const badCount = ratings.filter(r => r.good_bad === 'bad').length;
  const totalRatings = goodCount + badCount;
  const avgRating = totalRatings > 0 ? (goodCount / totalRatings) * 100 : 0;

  const totalCost = ratings.reduce((sum, r) => sum + r.cost, 0);
  const avgCost = ratings.length > 0 ? totalCost / ratings.length : null;

  return {
    dateId,
    dateName: date.name,
    avgCost,
    avgRating,
    totalRatings,
    goodCount,
    badCount,
    filters: filters || {}
  };
}
