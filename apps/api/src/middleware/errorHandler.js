import { env } from "../config/env.js";

export function notFound(req, res) {
  res.status(404).json({
    status: "error",
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
}

function requestContext(req) {
  return {
    timestamp: new Date().toISOString(),
    userId: req.user?._id?.toString(),
    method: req.method,
    route: req.originalUrl,
    ip: req.ip,
    body: req.body
  };
}

export function errorHandler(err, req, res, _next) {
  const statusCode = err.statusCode || 500;
  const isOperational = err.isOperational || statusCode < 500;
  const isMongoError = err.name?.includes("Mongo") || err.name?.includes("Mongoose") || err.code === 11000;
  const isUploadValidationError = err.name === "MulterError" || ["Invalid image upload", "Invalid CSV upload"].includes(err.message);
  const responseStatus = isUploadValidationError ? 400 : statusCode;

  console.error({ ...requestContext(req), error: { name: err.name, message: err.message, stack: err.stack, details: err.details } });

  res.status(responseStatus).json({
    status: "error",
    message: isUploadValidationError ? err.message : isMongoError ? "Something went wrong" : isOperational ? err.message : "Something went wrong",
    details: env.nodeEnv === "production" ? undefined : err.details,
    stack: env.nodeEnv === "development" && !isMongoError ? err.stack : undefined
  });
}
