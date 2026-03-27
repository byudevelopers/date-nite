import { Router } from "express";
import { createRatingService, getAveragesForDate } from "../services/ratingService";
import { authenticateToken } from "../middleware/auth";
import type { CreateRatingDTO } from "@shared/rating.types";

const router = Router();

// POST /ratings - Create new rating (protected)
router.post("/", authenticateToken, async (req, res) => {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({
      error: "UNAUTHORIZED",
      message: "User ID not found in token"
    });
  }

  const { date_id, romance_level, group_size, cost, good_bad, first_date } = req.body as CreateRatingDTO;

  // Validate required fields
  if (!date_id || !romance_level || !group_size || cost === undefined || !good_bad || first_date === undefined) {
    return res.status(400).json({
      error: "VALIDATION_ERROR",
      message: "All fields are required: date_id, romance_level, group_size, cost, good_bad, first_date"
    });
  }

  try {
    const result = await createRatingService(userId, req.body);
    res.status(201).json(result);
  } catch (error: any) {
    if (error.message === 'VALIDATION_ERROR') {
      return res.status(400).json({
        error: "VALIDATION_ERROR",
        message: "Invalid rating data provided. Check enum values and data types."
      });
    }
    if (error.message === 'DATE_NOT_FOUND') {
      return res.status(404).json({
        error: "DATE_NOT_FOUND",
        message: "Date not found"
      });
    }
    if (error.message === 'DUPLICATE_RATING_COOLDOWN') {
      return res.status(429).json({
        error: "DUPLICATE_RATING_COOLDOWN",
        message: "You can only rate each date once per 24 hours"
      });
    }
    res.status(500).json({
      error: "RATING_CREATION_FAILED",
      message: error.message || "Failed to create rating"
    });
  }
});

// GET /ratings/averages/:dateId - Get aggregated statistics (public)
router.get("/averages/:dateId", async (req, res) => {
  const { dateId } = req.params;
  const { romance_level, group_size, first_date } = req.query;

  // Validate dateId
  if (!dateId) {
    return res.status(400).json({
      error: "VALIDATION_ERROR",
      message: "dateId parameter is required"
    });
  }

  // Build filters object
  const filters: {
    romance_level?: 'casual' | 'romantic';
    group_size?: 'single' | 'double' | 'group';
    first_date?: boolean;
  } = {};

  // Validate and parse filters
  if (romance_level) {
    if (romance_level !== 'casual' && romance_level !== 'romantic') {
      return res.status(400).json({
        error: "INVALID_FILTERS",
        message: "romance_level must be 'casual' or 'romantic'"
      });
    }
    filters.romance_level = romance_level as 'casual' | 'romantic';
  }

  if (group_size) {
    if (group_size !== 'single' && group_size !== 'double' && group_size !== 'group') {
      return res.status(400).json({
        error: "INVALID_FILTERS",
        message: "group_size must be 'single', 'double', or 'group'"
      });
    }
    filters.group_size = group_size as 'single' | 'double' | 'group';
  }

  if (first_date !== undefined) {
    if (first_date !== 'true' && first_date !== 'false') {
      return res.status(400).json({
        error: "INVALID_FILTERS",
        message: "first_date must be 'true' or 'false'"
      });
    }
    filters.first_date = first_date === 'true';
  }

  try {
    const result = await getAveragesForDate(dateId, Object.keys(filters).length > 0 ? filters : undefined);
    res.status(200).json(result);
  } catch (error: any) {
    if (error.message === 'DATE_NOT_FOUND') {
      return res.status(404).json({
        error: "DATE_NOT_FOUND",
        message: "Date not found"
      });
    }
    res.status(500).json({
      error: "SERVER_ERROR",
      message: error.message || "Failed to get rating averages"
    });
  }
});

export default router;
