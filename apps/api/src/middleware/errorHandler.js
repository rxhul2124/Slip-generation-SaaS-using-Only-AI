import { env } from "../config/env.js";

export function notFound(req, res) {
  res.status(404).json({
    status: "error",
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
}

export function errorHandler(err, _req, res, _next) {
  const statusCode = err.statusCode || 500;
  const isOperational = err.isOperational || statusCode < 500;

  if (!isOperational) {
    console.error(err);
  }

  res.status(statusCode).json({
    status: "error",
    message: isOperational ? err.message : "Internal server error",
    details: err.details,
    stack: env.nodeEnv === "development" ? err.stack : undefined
  });
}
