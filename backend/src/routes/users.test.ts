import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";
import usersRouter from "./users";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/users", usersRouter);

describe("POST /users", () => {
  it("should register a user and set authToken cookie", async () => {
    const uniqueEmail = `testuser_${Date.now()}@example.com`;
    const res = await request(app)
      .post("/users")
      .send({
        email: uniqueEmail,
        password: "testpass123",
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("user");
    expect(res.body).not.toHaveProperty("accessToken"); // No longer in body
    expect(res.body.user).toHaveProperty("email", uniqueEmail);
    expect(res.body.user).toHaveProperty("id");
    expect(res.body.user).toHaveProperty("favorites");

    // Verify cookie is set
    expect(res.headers['set-cookie']).toBeDefined();
    const cookieHeader = res.headers['set-cookie'];
    const cookies = Array.isArray(cookieHeader) ? cookieHeader : [cookieHeader];
    expect(cookies.some(cookie => cookie?.startsWith('authToken='))).toBe(true);
  });
});
