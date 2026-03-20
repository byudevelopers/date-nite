import { Router } from "express";
import { registerUserService } from "../services/userService";
import { loginService } from "../services/authService";
import { authenticateToken } from "../middleware/auth";
import type { RegisterUserDTO } from "@shared/user.types";
import type { LoginDTO } from "@shared/auth.types";
import { logServerError } from "../utils/errorLogging";
import { getFavoriteDates } from "../services/userService";
import { removeFavoriteDate } from "../services/userService";

const router = Router();

// POST /users - Register
router.post("/", async (req, res) => {
  const { email, password } = req.body as RegisterUserDTO;
  if (!email || !password) {
    return res.status(400).json({
      error: "VALIDATION_ERROR",
      message: "email and password required",
    });
  }
  try {
    const result = await registerUserService({ email, password });
    res.cookie('authToken', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.status(201).json(result);
  } catch (error: any) {
    logServerError(req, error, "register_user");
    res.status(500).json({
      error: "REGISTRATION_FAILED",
      message: error.message || "Failed to register user",
    });
  }
});

// POST /users/login - Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body as LoginDTO;
  if (!email || !password) {
    return res.status(400).json({
      error: "VALIDATION_ERROR",
      message: "email and password required",
    });
  }
  try {
    const result = await loginService({ email, password });
    res.cookie('authToken', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.status(200).json({ user: result.user });
  } catch (error: any) {
    if (error.message === "INVALID_CREDENTIALS") {
      return res.status(401).json({
        error: "INVALID_CREDENTIALS",
        message: "Invalid email or password",
      });
    }
    logServerError(req, error, "login_user");
    res.status(500).json({
      error: "LOGIN_FAILED",
      message: "Login failed",
    });
  }
});

// POST /users/logout - Logout
router.post("/logout", async (req, res) => {
  res.clearCookie('authToken');
  res.status(200).json({ message: 'Logged out successfully' });
});

// GET /users/me - Get current user (protected route example)
router.get("/me", authenticateToken, async (req, res) => {
  res.status(200).json({ user: req.user });
});

router.get("/favorites", authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(400).json({
        error: "USER_ID_MISSING",
        message: "User ID is missing",
      });
    }
    const favorites = getFavoriteDates(userId);
    if (favorites === null) {
      return res.status(404).json({
        error: "FAVORITES_NOT_FOUND",
        message: "No favorite dates found for this user",
      });
    }
    res.status(200).json({ favorites });
  } catch (error: any) {
    logServerError(req, error, "get_favorites");
    res.status(500).json({
    error: "GET_FAVORITES_FAILED",
    message: "Failed to get favorite dates",
  });
  }
});

router.delete("/favorites/remove", authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { dateId } = req.body;
    if (!userId || !dateId) {
      return res.status(400).json({
        error: "VALIDATION_ERROR",
        message: "User ID and date ID are required",
      });
    }
    removeFavoriteDate(userId, dateId);
    res.status(200).json({ message: "Favorite date removed successfully" });

  } catch (error: any) {
    logServerError(req, error, "remove_favorite");
    res.status(500).json({
      error: "REMOVE_FAVORITE_FAILED",
      message: "Failed to remove favorite date",
    });
  }
});
export default router;