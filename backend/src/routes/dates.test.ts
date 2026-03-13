import request from "supertest";
import express from "express";
import datesRouter from "./dates";

const app = express();
app.use(express.json());
app.use("/dates", datesRouter);
describe("Date Endpoints", () => {
  let accessToken: string;
  let testPlaceId: string;

  beforeAll(async () => {
    // Register test user and get token
    const usersRouter = require("./users").default;
    const authApp = express();
    authApp.use(express.json());
    authApp.use("/users", usersRouter);

    const testEmail = `date_test_${Date.now()}@example.com`;
    const registerRes = await request(authApp)
      .post("/users")
      .send({ email: testEmail, password: "TestPass123!" });

    accessToken = registerRes.body.accessToken;

    // Get a real Google Place ID for testing
    const searchRes = await request(app)
      .get("/dates/search-places")
      .query({ query: "ice cream", location: "Provo, UT" });

    if (searchRes.body.places?.length > 0) {
      testPlaceId = searchRes.body.places[0].place_id;
    }
  });

  describe("GET /dates", () => {
    it("should return 200 and a list of dates", async () => {
      const res = await request(app).get("/dates");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe("GET /dates/search-places", () => {
    it("should return Google Places for valid search", async () => {
      const res = await request(app)
        .get("/dates/search-places")
        .query({ query: "pizza", location: "Provo, UT" });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("places");
      expect(res.body).toHaveProperty("status");
      expect(Array.isArray(res.body.places)).toBe(true);
    });

    it("should return places with query only (no location)", async () => {
      const res = await request(app)
        .get("/dates/search-places")
        .query({ query: "restaurants in Provo" });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("places");
    });

    it("should reject search without query parameter", async () => {
      const res = await request(app)
        .get("/dates/search-places")
        .query({ location: "Provo, UT" });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("VALIDATION_ERROR");
    });
  });

  describe("POST /dates/create", () => {
    it("should create venue date with valid Place ID", async () => {
      if (!testPlaceId) {
        console.warn("Skipping test - no Place ID available");
        return;
      }

      const res = await request(app)
        .post("/dates/create")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          type: "venue",
          name: "Test Ice Cream Shop (123 Main St, Provo UT)",
          google_place_id: testPlaceId,
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("date");
      expect(res.body.date).toHaveProperty("type", "venue");
      expect(res.body.date).toHaveProperty("google_place_id", testPlaceId);
      expect(res.body.date).toHaveProperty("icon"); // Auto-generated
      expect(res.body.date.description).toBeTruthy(); // From Google Places
    });

    it("should create non-venue date without Place ID", async () => {
      const res = await request(app)
        .post("/dates/create")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          type: "non-venue",
          name: "Movie Night at Home",
        });

      expect(res.status).toBe(201);
      expect(res.body.date).toHaveProperty("type", "non-venue");
      expect(res.body.date).toHaveProperty("name", "Movie Night at Home");
      expect(res.body.date).toHaveProperty("icon"); // Auto-generated
      expect(res.body.date.google_place_id).toBeFalsy();
    });

    it("should reject creation without authentication", async () => {
      const res = await request(app)
        .post("/dates/create")
        .send({ type: "venue", name: "Test", google_place_id: "test-id" });

      expect(res.status).toBe(401);
    });

    it("should reject venue date without google_place_id", async () => {
      const res = await request(app)
        .post("/dates/create")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ type: "venue", name: "Test Venue" });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("PLACE_ID_REQUIRED");
    });

    it("should reject venue date with invalid google_place_id", async () => {
      const res = await request(app)
        .post("/dates/create")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          type: "venue",
          name: "Test Venue",
          google_place_id: "invalid-place-id-12345",
        });

      expect(res.status).toBe(404);
      expect(res.body.error).toBe("PLACE_NOT_FOUND");
    });

    it("should reject with invalid type", async () => {
      const res = await request(app)
        .post("/dates/create")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ type: "invalid", name: "Test" });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("INVALID_TYPE");
    });
  });
});
