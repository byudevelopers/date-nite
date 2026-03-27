import { Router } from "express";
import { getDateService, createDateService } from "../services/dateService";
import { authenticateToken } from "../middleware/auth";
import { logServerError } from "../utils/errorLogging";
const router = Router();

// get dates
router.get("/", async (req, res) => {
  try {
    const result = await getDateService();
    res.status(200).json(result);
  } catch (error: any) {
    logServerError(req, error, "get_dates");
    res.status(500).json({ error: error.message || "Failed to get dates" });
  }
});

// create date
router.post("/", authenticateToken, (req, res) => {
  const { name, type, description, location, avg_cost, recommended_group, icon, group_size } = req.body;

  if (!name || !type) {
    res.status(400).json({ error: "VALIDATION_ERROR", message: "name and type are required" });
    return;
  }

  if (type !== "venue" && type !== "non-venue") {
    res.status(400).json({ error: "VALIDATION_ERROR", message: "type must be 'venue' or 'non-venue'" });
    return;
  }

  try {
    const date = createDateService({ name, type, description, location, avg_cost, recommended_group, icon, group_size });
    res.status(201).json(date);
  } catch (error: any) {
    logServerError(req, error, "create_date");
    res.status(500).json({ error: error.message || "Failed to create date" });
  }
});

export default router;
