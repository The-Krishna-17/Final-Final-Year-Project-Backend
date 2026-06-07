import rateLimit from "express-rate-limit";
import { ApiError } from "../utils/ApiError.js";

const createLimiter = (windowMs, max, message) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next) => {
      next(ApiError.tooMany(message));
    },
    keyGenerator: (req) => req.ip,
  });

// General API limiter
export const globalLimiter = createLimiter(
  15 * 60 * 1000, // 15 minutes
  200,
  "Too many requests from this IP, please try again after 15 minutes"
);

// Strict limiter for auth routes
export const authLimiter = createLimiter(
  15 * 60 * 1000, // 15 minutes
  20,
  "Too many authentication attempts, please try again after 15 minutes"
);

// Very strict limiter for password reset/forgot
export const passwordLimiter = createLimiter(
  60 * 60 * 1000, // 1 hour
  5,
  "Too many password reset requests, please try again after 1 hour"
);
