import { Router } from "express";
import { registerUserService } from "../services/userService";
import { loginService, logoutService } from "../services/authService";
import { authenticateToken } from "../middleware/auth";
import type { RegisterUserDTO } from "@shared/user.types";
import type { LoginDTO } from "@shared/auth.types";

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

    // Set HttpOnly cookie
    res.cookie('authToken', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
    });

    // Return only user, no accessToken in body
    res.status(201).json({ user: result.user });
  } catch (error: any) {
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

    // Set HttpOnly cookie
    res.cookie('authToken', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
    });

    // Return only user, no accessToken in body
    res.status(200).json({ user: result.user });
  } catch (error: any) {
    if (error.message === "INVALID_CREDENTIALS") {
      return res.status(401).json({
        error: "INVALID_CREDENTIALS",
        message: "Invalid email or password",
      });
    }
    res.status(500).json({
      error: "LOGIN_FAILED",
      message: "Login failed",
    });
  }
});

// POST /users/logout - Logout (requires auth)
router.post("/logout", authenticateToken, async (req, res) => {
  try {
    // Clear the cookie
    res.clearCookie('authToken');

    const result = await logoutService();
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({
      error: "LOGOUT_FAILED",
      message: error.message || "Logout failed",
    });
  }
});

// GET /users/me - Get current user (protected route example)
router.get("/me", authenticateToken, async (req, res) => {
  res.status(200).json({ user: req.user });
});

export default router;