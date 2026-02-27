import request from "supertest";
import express from "express";
import usersRouter from "./users";

const app = express();
app.use(express.json());
app.use("/users", usersRouter);

describe("Authentication Endpoints", () => {
  let accessToken: string;
  const testEmail = `auth_test_${Date.now()}@example.com`;
  const testPassword = "TestPass123!";

  describe("POST /users (Registration)", () => {
    it("should register a new user and return access token", async () => {
      const res = await request(app)
        .post("/users")
        .send({ email: testEmail, password: testPassword });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("user");
      expect(res.body).toHaveProperty("accessToken");
      expect(res.body.user).toHaveProperty("email", testEmail);

      accessToken = res.body.accessToken;
    });

    it("should reject registration without email", async () => {
      const res = await request(app).post("/users").send({ password: testPassword });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("VALIDATION_ERROR");
    });
  });

  describe("POST /users/login (Login)", () => {
    it("should login existing user and return access token", async () => {
      const res = await request(app)
        .post("/users/login")
        .send({ email: testEmail, password: testPassword });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("user");
      expect(res.body).toHaveProperty("accessToken");
      expect(res.body.user.email).toBe(testEmail);
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
    it("should return user profile with valid token", async () => {
      const res = await request(app)
        .get("/users/me")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.user).toHaveProperty("userId");
      expect(res.body.user).toHaveProperty("email", testEmail);
    });

    it("should reject request without token", async () => {
      const res = await request(app).get("/users/me");

      expect(res.status).toBe(401);
      expect(res.body.error).toBe("UNAUTHORIZED");
    });
  });

  describe("POST /users/logout (Logout)", () => {
    it("should logout user successfully", async () => {
      const res = await request(app)
        .post("/users/logout")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Logout successful");
    });
  });
});
