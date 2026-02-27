import request from "supertest";
import express from "express";
import healthRouter from "./health";

const app = express();
app.use("/health", healthRouter);

describe("GET /health", () => {
  it("should return 200 status and health information", async () => {
    const res = await request(app).get("/health");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("status", "healthy");
    expect(res.body).toHaveProperty("timestamp");
    expect(res.body).toHaveProperty("uptime");
    expect(res.body).toHaveProperty("service", "date-nite-backend");
    expect(res.body).toHaveProperty("version");
  });

  it("should return valid timestamp", async () => {
    const res = await request(app).get("/health");

    const timestamp = new Date(res.body.timestamp);
    expect(timestamp).toBeInstanceOf(Date);
    expect(timestamp.getTime()).not.toBeNaN();
  });

  it("should return numeric uptime", async () => {
    const res = await request(app).get("/health");

    expect(typeof res.body.uptime).toBe("number");
    expect(res.body.uptime).toBeGreaterThanOrEqual(0);
  });
});
