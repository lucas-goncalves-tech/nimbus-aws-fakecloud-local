import type { NextFunction, Request, Response } from "express";
import { ErrorBase } from "../errors/base.error";
import { SessionError } from "../errors/session.error";
import { logger } from "../logging/logger";

/**
 * Contrato unico de erro: { code, message, requestId }.
 * Nunca devolve stack trace nem detalhes internos ao cliente.
 */
export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  const requestId = res.locals.requestId as string | undefined;

  if (err instanceof SessionError) {
    res.status(err.status).json({
      code: err.code,
      message: err.message,
      requestId,
    });
    return;
  }

  if (err instanceof ErrorBase) {
    res.status(err.status).json({
      code: err.code,
      message: err.message,
      requestId,
      ...(err.details ? { errors: err.details } : {}),
    });
    return;
  }

  logger.error("unhandled_error", {
    requestId,
    method: req.method,
    path: req.path,
    name: err.name,
    message: err.message,
  });

  res.status(500).json({
    code: "INTERNAL_ERROR",
    message: "Erro interno do servidor",
    requestId,
  });
}
