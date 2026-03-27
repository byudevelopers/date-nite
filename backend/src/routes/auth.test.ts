import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";
import usersRouter from "./users";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/users", usersRouter);

describe("Authentication Endpoints", () => {
  let cookies: string[];
  const testEmail = `auth_test_${Date.now()}@example.com`;
  const testPassword = "TestPass123!";

  describe("POST /users (Registration)", () => {
    it("should register a new user and set authToken cookie", async () => {
      const res = await request(app)
        .post("/users")
        .send({ email: testEmail, password: testPassword });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("user");
      expect(res.body).not.toHaveProperty("accessToken"); // No longer in body
      expect(res.body.user).toHaveProperty("email", testEmail);

      // Extract cookies for later use
      const cookieHeader = res.headers['set-cookie'];
      cookies = Array.isArray(cookieHeader) ? cookieHeader : [cookieHeader as string];
      expect(cookies).toBeDefined();
      expect(cookies.some(cookie => cookie.startsWith('authToken='))).toBe(true);
    });

    it("should reject registration without email", async () => {
      const res = await request(app).post("/users").send({ password: testPassword });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("VALIDATION_ERROR");
    });
  });

  describe("POST /users/login (Login)", () => {
    it("should login existing user and set authToken cookie", async () => {
      const res = await request(app)
        .post("/users/login")
        .send({ email: testEmail, password: testPassword });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("user");
      expect(res.body).not.toHaveProperty("accessToken"); // No longer in body
      expect(res.body.user.email).toBe(testEmail);

      // Verify cookie is set
      const cookieHeader = res.headers['set-cookie'];
      const loginCookies = Array.isArray(cookieHeader) ? cookieHeader : [cookieHeader as string];
      expect(loginCookies).toBeDefined();
      expect(loginCookies.some(cookie => cookie.startsWith('authToken='))).toBe(true);
    });

    it("should reject login with wrong password", async () => {
      const res = await request(app)
        .post("/users/login")
        .send({ email: testEmail, password: "wrongpassword" });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe("INVALID_CREDENTIALS");
    });
  });

  describe("GET /users/me (Protected Route)", () => {
    it("should return user profile with valid cookie", async () => {
      const res = await request(app)
        .get("/users/me")
        .set('Cookie', cookies);

      expect(res.status).toBe(200);
      expect(res.body.user).toHaveProperty("userId");
      expect(res.body.user).toHaveProperty("email", testEmail);
    });

    it("should reject request without cookie", async () => {
      const res = await request(app).get("/users/me");

      expect(res.status).toBe(401);
      expect(res.body.error).toBe("UNAUTHORIZED");
    });
  });

  describe("POST /users/logout (Logout)", () => {
    it("should logout user successfully and clear cookie", async () => {
      const res = await request(app)
        .post("/users/logout")
        .set('Cookie', cookies);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Logout successful");

      // Verify cookie is cleared
      const cookieHeader = res.headers['set-cookie'];
      const logoutCookies = Array.isArray(cookieHeader) ? cookieHeader : [cookieHeader as string];
      expect(logoutCookies).toBeDefined();
      expect(logoutCookies.some(cookie => cookie.includes('authToken=;'))).toBe(true);
    });
  });
});
