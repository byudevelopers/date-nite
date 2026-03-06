import { supabase, getDate, getAllDates, createDate } from "../database";
import { fetchGooglePlace } from "./googlePlacesService";
import { generateIcon } from "../utils/iconGenerator";
import type {
  CreateDateDTO,
  CreateDateResponseDTO,
  Date
} from "@shared/date.types";

// get date by id
export async function fetchDateById(id: string) {
  return await getDate(id);
}

// get all dates
export async function fetchAllDates() {
  return await getAllDates();
}

// return all dates
export async function getDateService() {
  const dates = fetchAllDates();
  return dates;
}

// Create new date idea
export async function createDateService(
  dateData: CreateDateDTO
): Promise<CreateDateResponseDTO> {
  const { type, name, google_place_id } = dateData;

  // Validate type field
  if (type !== 'venue' && type !== 'non-venue') {
    throw new Error('INVALID_TYPE');
  }

  // Validate name is not empty
  if (!name || name.trim().length === 0) {
    throw new Error('VALIDATION_ERROR');
  }

  // For venue dates, google_place_id is required
  if (type === 'venue' && !google_place_id) {
    throw new Error('PLACE_ID_REQUIRED');
  }

  // For non-venue dates, google_place_id should not be provided
  if (type === 'non-venue' && google_place_id) {
    throw new Error('VALIDATION_ERROR');
  }

  let description: string | undefined;
  let icon: string;

  // Handle venue dates with Google Places integration
  if (type === 'venue' && google_place_id) {
    try {
      // Fetch and validate Google Place
      const place = await fetchGooglePlace(google_place_id);

      // Use editorial summary or types as description
      if (place.editorial_summary?.overview) {
        description = place.editorial_summary.overview;
      } else if (place.types && place.types.length > 0) {
        // Format types as description (e.g., "Restaurant, Food")
        description = place.types
          .map(type => type.replace(/_/g, ' '))
          .map(type => type.charAt(0).toUpperCase() + type.slice(1))
          .slice(0, 3)
          .join(', ');
      }

      // Generate icon from name and types
      const typesText = place.types.join(' ');
      icon = generateIcon(`${name} ${typesText}`, type);

    } catch (error: any) {
      // Re-throw specific Places API errors
      if (error.message === 'PLACE_NOT_FOUND' ||
          error.message === 'PLACES_API_ERROR') {
        throw error;
      }
      throw new Error('DATE_CREATION_FAILED');
    }
  } else {
    // Non-venue: generate icon from name only
    icon = generateIcon(name, type);
  }

  // Prepare data for database
  const dateToInsert = {
    type,
    name: name.trim(),
    icon,
    ...(description && { description }),
    ...(google_place_id && { google_place_id }),
  };

  try {
    const newDate = await createDate(dateToInsert);
    return { date: newDate as Date };
  } catch (error: any) {
    throw new Error('DATE_CREATION_FAILED');
  }
}

// function for setfavoriteda
