import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";

/** Request ID propagado no header e usado nos logs e no contrato de erro. */
export function requestIdMiddleware(_req: Request, res: Response, next: NextFunction): void {
  const header = _req.headers["x-request-id"];
  const requestId = typeof header === "string" && header.length <= 128 ? header : randomUUID();
  res.locals.requestId = requestId;
  res.setHeader("X-Request-Id", requestId);
  next();
}
