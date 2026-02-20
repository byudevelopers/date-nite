import { Router } from "express";
import { registerUserService } from "../services/userService";
const router = Router();

// Register user endpoint
router.post("/", async (req, res) => {
  const { email, password, favorites, username } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "email and password required" });
  }
  try {
    const result = await registerUserService({ email, password, favorites, username });
    res.status(201).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to register user" });
  }
});

export default router;
