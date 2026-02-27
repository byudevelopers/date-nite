import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

import express from "express";
import cors from "cors";
import usersRouter from "./routes/users";
import healthRouter from "./routes/health";

const app = express();

// CORS configuration
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json());

app.use("/health", healthRouter);
app.use("/users", usersRouter);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
