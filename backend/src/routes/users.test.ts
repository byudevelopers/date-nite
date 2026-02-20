import request from "supertest";
import express from "express";
import usersRouter from "./users";

const app = express();
app.use(express.json());
app.use("/users", usersRouter);

describe("POST /users", () => {
  it("should register a user and create a profile row", async () => {
    const uniqueEmail = `testuser_${Date.now()}@example.com`;
    const res = await request(app)
      .post("/users")
      .send({
        email: uniqueEmail,
        password: "testpass123",
        username: "testuser",
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("auth");
    expect(res.body.auth).toHaveProperty("user");
    expect(res.body.auth.user).toHaveProperty("email", uniqueEmail);
    expect(res.body).toHaveProperty("profile");
    expect(res.body.profile).toHaveProperty("email", uniqueEmail);
  });
});
