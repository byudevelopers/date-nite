import type { Request } from "express";

export function logServerError(
  req: Request,
  error: unknown,
  context: string,
): void {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;

  console.error("[backend][500]", {
    context,
    method: req.method,
    path: req.originalUrl,
    message,
    stack,
    timestamp: new Date().toISOString(),
  });
}