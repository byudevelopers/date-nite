import request from "supertest";
import express from "express";
import usersRouter from "./users";

const app = express();
app.use(express.json());
app.use("/users", usersRouter);

describe("POST /users", () => {
  it("should create a user and return a stub JWT", async () => {
    const res = await request(app)
      .post("/users")
      .send({ username: "testuser", password: "testpass" });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("username", "testuser");
    expect(res.body).toHaveProperty("token", "stub.jwt.token");
  });
});
