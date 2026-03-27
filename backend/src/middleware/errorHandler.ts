import type { NextFunction, Request, Response } from "express";
import { logServerError } from "../utils/errorLogging";

export function errorHandler(
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  logServerError(req, error, "unhandled_error");

  if (res.headersSent) {
    return;
  }

  res.status(500).json({
    error: "INTERNAL_SERVER_ERROR",
    message: "An unexpected error occurred",
  });
}