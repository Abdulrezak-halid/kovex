import type { ErrorRequestHandler, RequestHandler } from "express";
import { validationErrorResponse } from "../routes/validation";

const safeUnexpectedError = "An unexpected error occurred, please try again later";

export class HttpError extends Error {
  readonly statusCode: number;
  readonly expose: boolean;

  constructor(statusCode: number, message: string, options?: { expose?: boolean }) {
    super(message);
    this.name = "HttpError";
    this.statusCode = statusCode;
    this.expose = options?.expose ?? statusCode < 500;
  }
}

function isValidationError(err: unknown) {
  return (
    !!err &&
    typeof err === "object" &&
    "issues" in err &&
    Array.isArray((err as { issues?: unknown }).issues)
  );
}

function statusCodeFromError(err: unknown) {
  if (!err || typeof err !== "object") return 500;

  const candidate =
    (err as { statusCode?: unknown }).statusCode ?? (err as { status?: unknown }).status;

  return typeof candidate === "number" && candidate >= 400 && candidate < 600
    ? candidate
    : 500;
}

function shouldExposeError(err: unknown, statusCode: number) {
  if (statusCode < 500) return true;
  return !!err && typeof err === "object" && (err as { expose?: unknown }).expose === true;
}

export const notFoundHandler: RequestHandler = (req, res) => {
  res.status(404).json({ error: "Not found", path: req.path });
};

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (res.headersSent) {
    next(err);
    return;
  }

  if (isValidationError(err)) {
    req.log.warn({ err }, "Request validation failed");
    res.status(400).json(validationErrorResponse(err));
    return;
  }

  const statusCode = statusCodeFromError(err);
  const isUnexpected = statusCode >= 500;
  const error = shouldExposeError(err, statusCode)
    ? err instanceof Error
      ? err.message
      : "Request failed"
    : safeUnexpectedError;

  const log = isUnexpected ? req.log.error.bind(req.log) : req.log.warn.bind(req.log);
  log({ err, statusCode }, isUnexpected ? "Unhandled request error" : "Request failed");

  res.status(statusCode).json({ error });
};
