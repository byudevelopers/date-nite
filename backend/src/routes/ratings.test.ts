import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";
import ratingsRouter from "./ratings";
import { getDate } from "../database";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/ratings", ratingsRouter);

describe("Rating Endpoints", () => {
  let cookies: string[];
  let testDateId: string;

  beforeAll(async () => {
    // Register test user and get cookies
    const usersRouter = require("./users").default;
    const datesRouter = require("./dates").default;
    const authApp = express();
    authApp.use(express.json());
    authApp.use(cookieParser());
    authApp.use("/users", usersRouter);
    authApp.use("/dates", datesRouter);

    const testEmail = `rating_test_${Date.now()}@example.com`;
    const registerRes = await request(authApp)
      .post("/users")
      .send({ email: testEmail, password: "TestPass123!" });

    const cookieHeader = registerRes.headers['set-cookie'];
    cookies = Array.isArray(cookieHeader) ? cookieHeader : [cookieHeader as string];

    // Create a test date for rating
    const dateRes = await request(authApp)
      .post("/dates/create")
      .set('Cookie', cookies)
      .send({
        type: "non-venue",
        name: "Test Date for Ratings"
      });

    testDateId = dateRes.body.date.id;
  });

  describe("POST /ratings", () => {
    it("should create rating with valid data", async () => {
      // Create a unique date for this test to avoid cooldown conflicts
      const usersRouter = require("./users").default;
      const datesRouter = require("./dates").default;
      const authApp = express();
      authApp.use(express.json());
      authApp.use(cookieParser());
      authApp.use("/users", usersRouter);
      authApp.use("/dates", datesRouter);

      const dateRes = await request(authApp)
        .post("/dates/create")
        .set('Cookie', cookies)
        .send({
          type: "non-venue",
          name: "Date for Valid Rating Test"
        });

      const uniqueDateId = dateRes.body.date.id;

      const res = await request(app)
        .post("/ratings")
        .set('Cookie', cookies)
        .send({
          date_id: uniqueDateId,
          romance_level: "romantic",
          group_size: "double",
          cost: 50.00,
          good_bad: "good",
          first_date: true
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("rating");
      expect(res.body.rating).toHaveProperty("id");
      expect(res.body.rating.date_id).toBe(uniqueDateId);
      expect(res.body.rating.romance_level).toBe("romantic");
      expect(res.body.rating.group_size).toBe("double");
      expect(res.body.rating.cost).toBe(50.00);
      expect(res.body.rating.good_bad).toBe("good");
      expect(res.body.rating.first_date).toBe(true);
      expect(res.body.rating).toHaveProperty("created_at");
    });

    it("should fail without authentication", async () => {
      const res = await request(app)
        .post("/ratings")
        .send({
          date_id: testDateId,
          romance_level: "casual",
          group_size: "single",
          cost: 25.00,
          good_bad: "good",
          first_date: false
        });

      expect(res.status).toBe(401);
    });

    it("should fail if required fields missing", async () => {
      const res = await request(app)
        .post("/ratings")
        .set('Cookie', cookies)
        .send({
          date_id: testDateId,
          romance_level: "casual"
          // Missing other required fields
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("VALIDATION_ERROR");
    });

    it("should fail if date doesn't exist", async () => {
      const res = await request(app)
        .post("/ratings")
        .set('Cookie', cookies)
        .send({
          date_id: "non-existent-date-id",
          romance_level: "casual",
          group_size: "single",
          cost: 25.00,
          good_bad: "good",
          first_date: false
        });

      expect(res.status).toBe(404);
      expect(res.body.error).toBe("DATE_NOT_FOUND");
    });

    it("should fail if romance_level invalid", async () => {
      const res = await request(app)
        .post("/ratings")
        .set('Cookie', cookies)
        .send({
          date_id: testDateId,
          romance_level: "invalid_value",
          group_size: "single",
          cost: 25.00,
          good_bad: "good",
          first_date: false
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("VALIDATION_ERROR");
    });

    it("should fail if group_size invalid", async () => {
      const res = await request(app)
        .post("/ratings")
        .set('Cookie', cookies)
        .send({
          date_id: testDateId,
          romance_level: "casual",
          group_size: "invalid_value",
          cost: 25.00,
          good_bad: "good",
          first_date: false
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("VALIDATION_ERROR");
    });

    it("should fail if good_bad invalid", async () => {
      const res = await request(app)
        .post("/ratings")
        .set('Cookie', cookies)
        .send({
          date_id: testDateId,
          romance_level: "casual",
          group_size: "single",
          cost: 25.00,
          good_bad: "invalid_value",
          first_date: false
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("VALIDATION_ERROR");
    });

    it("should fail if cost is negative", async () => {
      const res = await request(app)
        .post("/ratings")
        .set('Cookie', cookies)
        .send({
          date_id: testDateId,
          romance_level: "casual",
          group_size: "single",
          cost: -10.00,
          good_bad: "good",
          first_date: false
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("VALIDATION_ERROR");
    });

    it("should update date.avg_rating and avg_cost after creation", async () => {
      // Create a unique test date
      const usersRouter = require("./users").default;
      const datesRouter = require("./dates").default;
      const authApp = express();
      authApp.use(express.json());
      authApp.use(cookieParser());
      authApp.use("/users", usersRouter);
      authApp.use("/dates", datesRouter);

      const dateRes = await request(authApp)
        .post("/dates/create")
        .set('Cookie', cookies)
        .send({
          type: "non-venue",
          name: "Date for Average Test"
        });

      const newDateId = dateRes.body.date.id;

      // Create first rating
      await request(app)
        .post("/ratings")
        .set('Cookie', cookies)
        .send({
          date_id: newDateId,
          romance_level: "casual",
          group_size: "single",
          cost: 30.00,
          good_bad: "good",
          first_date: false
        });

      // Check that avg was updated
      const date = getDate(newDateId);
      expect(date).not.toBeNull();
      expect(date?.avg_cost).toBe(30.00);
      expect(date?.avg_rating).toBe(100); // 100% good
    });

    it("should handle first_date boolean correctly", async () => {
      // Create unique date for this test
      const usersRouter = require("./users").default;
      const datesRouter = require("./dates").default;
      const authApp = express();
      authApp.use(express.json());
      authApp.use(cookieParser());
      authApp.use("/users", usersRouter);
      authApp.use("/dates", datesRouter);

      const dateRes = await request(authApp)
        .post("/dates/create")
        .set('Cookie', cookies)
        .send({
          type: "non-venue",
          name: "Date for Boolean Test"
        });

      const newDateId = dateRes.body.date.id;

      const res = await request(app)
        .post("/ratings")
        .set('Cookie', cookies)
        .send({
          date_id: newDateId,
          romance_level: "casual",
          group_size: "single",
          cost: 20.00,
          good_bad: "good",
          first_date: true
        });

      expect(res.status).toBe(201);
      expect(res.body.rating.first_date).toBe(true);

      // Create another unique date
      const dateRes2 = await request(authApp)
        .post("/dates/create")
        .set('Cookie', cookies)
        .send({
          type: "non-venue",
          name: "Date for Boolean Test 2"
        });

      const newDateId2 = dateRes2.body.date.id;

      const res2 = await request(app)
        .post("/ratings")
        .set('Cookie', cookies)
        .send({
          date_id: newDateId2,
          romance_level: "casual",
          group_size: "single",
          cost: 20.00,
          good_bad: "good",
          first_date: false
        });

      expect(res2.status).toBe(201);
      expect(res2.body.rating.first_date).toBe(false);
    });
  });

  describe("GET /ratings/averages/:dateId", () => {
    let averagesTestDateId: string;

    beforeAll(async () => {
      // Create a date and add multiple ratings for testing averages
      const usersRouter = require("./users").default;
      const datesRouter = require("./dates").default;
      const authApp = express();
      authApp.use(express.json());
      authApp.use(cookieParser());
      authApp.use("/users", usersRouter);
      authApp.use("/dates", datesRouter);

      // Create test date
      const dateRes = await request(authApp)
        .post("/dates/create")
        .set('Cookie', cookies)
        .send({
          type: "non-venue",
          name: "Date for Averages Test"
        });

      averagesTestDateId = dateRes.body.date.id;

      // Add multiple ratings
      await request(app)
        .post("/ratings")
        .set('Cookie', cookies)
        .send({
          date_id: averagesTestDateId,
          romance_level: "romantic",
          group_size: "double",
          cost: 60.00,
          good_bad: "good",
          first_date: true
        });

      // Wait to avoid cooldown (in real test, we'd mock time or use different users)
      // For now, we'll create additional test dates for some tests
    });

    it("should return averages for date with no filters", async () => {
      const res = await request(app)
        .get(`/ratings/averages/${averagesTestDateId}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("dateId", averagesTestDateId);
      expect(res.body).toHaveProperty("dateName");
      expect(res.body).toHaveProperty("avgCost");
      expect(res.body).toHaveProperty("avgRating");
      expect(res.body).toHaveProperty("totalRatings");
      expect(res.body).toHaveProperty("goodCount");
      expect(res.body).toHaveProperty("badCount");
      expect(res.body).toHaveProperty("filters");
    });

    it("should calculate 100% avg_rating with all good ratings", async () => {
      const res = await request(app)
        .get(`/ratings/averages/${averagesTestDateId}`);

      expect(res.status).toBe(200);
      expect(res.body.goodCount).toBeGreaterThan(0);
      expect(res.body.badCount).toBe(0);
      expect(res.body.avgRating).toBe(100);
    });

    it("should filter by romance_level correctly", async () => {
      const res = await request(app)
        .get(`/ratings/averages/${averagesTestDateId}`)
        .query({ romance_level: "romantic" });

      expect(res.status).toBe(200);
      expect(res.body.filters.romance_level).toBe("romantic");
    });

    it("should filter by group_size correctly", async () => {
      const res = await request(app)
        .get(`/ratings/averages/${averagesTestDateId}`)
        .query({ group_size: "double" });

      expect(res.status).toBe(200);
      expect(res.body.filters.group_size).toBe("double");
    });

    it("should filter by first_date correctly", async () => {
      const res = await request(app)
        .get(`/ratings/averages/${averagesTestDateId}`)
        .query({ first_date: "true" });

      expect(res.status).toBe(200);
      expect(res.body.filters.first_date).toBe(true);
    });

    it("should fail if dateId doesn't exist", async () => {
      const res = await request(app)
        .get("/ratings/averages/non-existent-id");

      expect(res.status).toBe(404);
      expect(res.body.error).toBe("DATE_NOT_FOUND");
    });

    it("should fail if filter values invalid", async () => {
      const res = await request(app)
        .get(`/ratings/averages/${averagesTestDateId}`)
        .query({ romance_level: "invalid" });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("INVALID_FILTERS");
    });

    it("should return 0 ratings if no matches with filters", async () => {
      const res = await request(app)
        .get(`/ratings/averages/${averagesTestDateId}`)
        .query({ romance_level: "casual" }); // We only created romantic ratings

      expect(res.status).toBe(200);
      expect(res.body.totalRatings).toBe(0);
      expect(res.body.avgRating).toBe(0);
      expect(res.body.avgCost).toBeNull();
    });
  });
});
