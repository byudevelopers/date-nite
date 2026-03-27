import { Router } from "express";
import { getDateService, createDateService } from "../services/dateService";
import { searchGooglePlaces } from "../services/googlePlacesService";
import { authenticateToken } from "../middleware/auth";
import type { CreateDateDTO } from "@shared/date.types";

import { logServerError } from "../utils/errorLogging";
const router = Router();

// GET /dates - Get all dates
router.get("/", async (req, res) => {
  try {
    const result = await getDateService();
    res.status(200).json(result);
  } catch (error: any) {
    logServerError(req, error, "get_dates");
    res.status(500).json({ error: error.message || "Failed to get dates" });
  }
});

// GET /dates/search-places - Search Google Places (no auth required for search)
router.get("/search-places", async (req, res) => {
  const { query, location } = req.query;

  // Validate query parameter (location is optional)
  if (!query) {
    return res.status(400).json({
      error: "VALIDATION_ERROR",
      message: "query parameter is required",
    });
  }

  try {
    const results = await searchGooglePlaces(
      query as string,
      location as string | undefined
    );
    res.status(200).json(results);
  } catch (error: any) {
    if (error.message === 'PLACES_API_ERROR') {
      return res.status(503).json({
        error: "PLACES_API_ERROR",
        message: "Google Places service is currently unavailable",
      });
    }
    res.status(500).json({
      error: "SEARCH_FAILED",
      message: "Failed to search places",
    });
  }
});

// POST /dates/create - Create new date idea (protected)
router.post("/create", authenticateToken, async (req, res) => {
  const { type, name, google_place_id } = req.body as CreateDateDTO;

  // Validate required fields
  if (!type || !name) {
    return res.status(400).json({
      error: "VALIDATION_ERROR",
      message: "type and name are required",
    });
  }

  // Validate type field
  if (type !== 'venue' && type !== 'non-venue') {
    return res.status(400).json({
      error: "INVALID_TYPE",
      message: "type must be either 'venue' or 'non-venue'",
    });
  }

  // Validate google_place_id for venue dates
  if (type === 'venue' && !google_place_id) {
    return res.status(400).json({
      error: "PLACE_ID_REQUIRED",
      message: "google_place_id is required for venue dates",
    });
  }

  try {
    const dateDTO: CreateDateDTO = { type, name };
    if (google_place_id) {
      dateDTO.google_place_id = google_place_id;
    }
    const result = await createDateService(dateDTO);
    res.status(201).json(result);
  } catch (error: any) {
    if (error.message === 'INVALID_TYPE') {
      return res.status(400).json({
        error: "INVALID_TYPE",
        message: "type must be either 'venue' or 'non-venue'",
      });
    }
    if (error.message === 'PLACE_ID_REQUIRED') {
      return res.status(400).json({
        error: "PLACE_ID_REQUIRED",
        message: "google_place_id is required for venue dates",
      });
    }
    if (error.message === 'PLACE_NOT_FOUND') {
      return res.status(404).json({
        error: "PLACE_NOT_FOUND",
        message: "Google Place not found with provided ID",
      });
    }
    if (error.message === 'PLACES_API_ERROR') {
      return res.status(503).json({
        error: "PLACES_API_ERROR",
        message: "Google Places service is currently unavailable",
      });
    }
    if (error.message === 'VALIDATION_ERROR') {
      return res.status(400).json({
        error: "VALIDATION_ERROR",
        message: "Invalid date data provided",
      });
    }
    res.status(500).json({
      error: "DATE_CREATION_FAILED",
      message: error.message || "Failed to create date",
    });
  }
});

export default router;
