import { Router } from "express";
import { getDateService } from "../services/dateService";
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

export default router;
