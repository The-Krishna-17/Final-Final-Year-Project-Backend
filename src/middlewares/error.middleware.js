import mongoose from "mongoose";
import pkg from "jsonwebtoken";
const { JsonWebTokenError, TokenExpiredError } = pkg;
import { ZodError } from "zod";
import { ApiError } from "../utils/ApiError.js";
import { env } from "../config/env.js";

/**
 * Convert known error types to ApiError instances.
 */
const normalizeError = (err) => {
  // Already an operational ApiError
  if (err instanceof ApiError) return err;

  // Mongoose validation error
  if (err instanceof mongoose.Error.ValidationError) {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return ApiError.badRequest("Validation failed", errors);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    const value = err.keyValue?.[field];
    return ApiError.conflict(
      `${field.charAt(0).toUpperCase() + field.slice(1)} '${value}' is already in use`,
    );
  }

  // Mongoose cast error (e.g., invalid ObjectId)
  if (err instanceof mongoose.Error.CastError) {
    return ApiError.badRequest(`Invalid value for field '${err.path}'`);
  }

  // JWT errors
  if (err instanceof TokenExpiredError)
    return ApiError.unauthorized("Token has expired");
  if (err instanceof JsonWebTokenError)
    return ApiError.unauthorized("Invalid token");

  // Zod errors (shouldn't normally reach here if middleware is used)
  if (err instanceof ZodError) {
    const errors = err.errors.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
    return ApiError.badRequest("Validation failed", errors);
  }

  // Unknown error — treat as internal server error
  return ApiError.internal(env.IS_PRODUCTION ? err.message : err.message);
};

/**
 * Global error handler middleware.
 * Must be registered as the last middleware in the app.
 */
export const errorHandler = (err, req, res, next) => {
  const normalized = normalizeError(err);

  // Log non-operational (programmer) errors
  if (!normalized.isOperational || normalized.statusCode >= 500) {
    console.error(
      `[ERROR] ${new Date().toISOString()} ${req.method} ${req.originalUrl}`,
    );
    console.error(err);
  }

  return res.status(normalized.statusCode).json({
    success: false,
    message: normalized.message,
    ...(normalized.errors?.length > 0 && { errors: normalized.errors }),
    ...(!env.IS_PRODUCTION && err.stack && { stack: err.stack }),
  });
};

/**
 * 404 handler — catches all unmatched routes.
 */
export const notFoundHandler = (req, res, next) => {
  next(ApiError.notFound(`Route '${req.originalUrl}' not found`));
};
