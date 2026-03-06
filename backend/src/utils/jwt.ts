import jwt from "jsonwebtoken";
import { JWTPayload } from "@shared/auth.types";

const JWT_SECRET: string =
  process.env.JWT_SECRET || "fallback-secret-change-me";

export function signToken(payload: Omit<JWTPayload, "iat" | "exp">): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error("TOKEN_EXPIRED");
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error("TOKEN_INVALID");
    }
    throw error;
  }
}
