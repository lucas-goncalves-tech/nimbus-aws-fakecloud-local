import type { NextFunction, Request, Response } from "express";
import { envCheck } from "../helper/env-check.helper";
import { logger } from "../logging/logger";

/**
 * Log estruturado de requests. Nao registra query, body, token nem PII.
 * O requestId ja foi injetado pelo requestIdMiddleware.
 */
export const logMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  if (envCheck().NODE_ENV === "test") {
    next();
    return;
  }

  const startTime = Date.now();
  res.on("finish", () => {
    logger.info("http_request", {
      requestId: res.locals.requestId,
      method: req.method,
      path: req.path,
      status: res.statusCode,
      durationMs: Date.now() - startTime,
    });
  });

  next();
};
