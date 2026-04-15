import { AppError } from "../utils/appError.js";

export function notFoundHandler(req, _res, next) {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
}

export function errorHandler(error, _req, res, _next) {
  let statusCode = error.statusCode || 500;
  let message = error.message || "Something went wrong";
  let details = error.details || null;

  if (error.name === "ValidationError") {
    statusCode = 400;
    message = "Validation failed";
    details = Object.fromEntries(Object.entries(error.errors).map(([key, value]) => [key, value.message]));
  }

  if (error.code === 11000) {
    statusCode = 409;
    const fields = Object.keys(error.keyPattern || {});
    message = fields.length ? `Duplicate value for ${fields.join(", ")}` : "Duplicate value";
  }

  if (statusCode >= 500) {
    console.error(error);
  }

  res.status(statusCode).json({
    message,
    details
  });
}
