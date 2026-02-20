import { Router } from "express";
import { registerUserService } from "../services/userService";
import {
  loginUserService,
  logoutUserService,
} from "../services/userService";
const router = Router();

// Register user endpoint
router.post("/", async (req, res) => {
  const { email, password, favorites, username } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "email and password required" });
  }
  try {
    const result = await registerUserService({
      email,
      password,
      favorites,
      username,
    });
    res.status(201).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to register user" });
  }
});

//TODO: add endpoints for logout, login
// endpoints for logout 
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "email and password required" });
  }
  try {
    const auth = await loginUserService({ email, password });
    res.status(200).json({ auth });
  } catch (err: any) {
    res.status(401).json({ error: err.message || "invalid credentials" });
  }
});

router.post("/logout", async (req, res) => {
  try {
    await logoutUserService();
    // if you’re using a cookie, clear it here:
    // res.clearCookie("sb-access-token");
    res.status(200).json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "logout failed" });
  }
});

export default router;

