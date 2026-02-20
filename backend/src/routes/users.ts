import { Router } from "express";
const router = Router();

// Create user endpoint
router.post("/", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required" });
  }
  // Stub: pretend to create user and return a fake JWT
  // In real implementation, save user to DB and generate JWT
  const fakeJwt = "stub.jwt.token";
  res.status(201).json({ username, token: fakeJwt });
});

export default router;
