import { Router } from "express";
const router = Router();

// Example endpoint
router.get("/users", (req, res) => {
  res.json({ message: "User endpoint" });
});

export default router;
