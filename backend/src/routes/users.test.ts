import request from "supertest";
import express from "express";
import usersRouter from "./users";

const app = express();
app.use(express.json());
app.use("/users", usersRouter);

describe("POST /users", () => {
  it("should register a user and return access token", async () => {
    const uniqueEmail = `testuser_${Date.now()}@example.com`;
    const res = await request(app)
      .post("/users")
      .send({
        email: uniqueEmail,
        password: "testpass123",
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("user");
    expect(res.body).toHaveProperty("accessToken");
    expect(res.body.user).toHaveProperty("email", uniqueEmail);
    expect(res.body.user).toHaveProperty("id");
    expect(res.body.user).toHaveProperty("favorites");
  });
});
