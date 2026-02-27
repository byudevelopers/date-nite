import { Router } from "express";

const router = Router();

// Health check endpoint
router.get("/", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: "date-nite-backend",
    version: "1.0.0"
  });
});

export default router;
