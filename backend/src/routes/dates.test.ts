import request from "supertest";
import express from "express";
import datesRouter from "./dates";

const app = express();
app.use(express.json());
app.use("/dates", datesRouter);
describe("GET /dates", () => {
  it("should return 200 and a list of dates", async () => {
    const res = await request(app).get("/dates");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true); // Adjust as needed for your response shape
  });
});
