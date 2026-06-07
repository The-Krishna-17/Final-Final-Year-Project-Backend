import jwt from "jsonwebtoken";
import crypto from "crypto";
import { env } from "../config/env.js";
import RefreshToken from "../models/RefreshToken.js";

/**
 * Generate a signed JWT access token.
 */
export const generateAccessToken = (payload) => {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
    issuer: "auth-backend",
    audience: "auth-backend-client",
  });
};

/**
 * Generate a signed JWT refresh token.
 */
export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
    issuer: "auth-backend",
    audience: "auth-backend-client",
  });
};

/**
 * Verify a JWT access token.
 */
export const verifyAccessToken = (token) => {
  return jwt.verify(token, env.JWT_ACCESS_SECRET, {
    issuer: "auth-backend",
    audience: "auth-backend-client",
  });
};

/**
 * Verify a JWT refresh token.
 */
export const verifyRefreshToken = (token) => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET, {
    issuer: "auth-backend",
    audience: "auth-backend-client",
  });
};

/**
 * Create and persist a refresh token in the database.
 */
export const createRefreshTokenRecord = async (userId, token, req) => {
  const decoded = verifyRefreshToken(token);
  const expiresAt = new Date(decoded.exp * 1000);

  return RefreshToken.create({
    token,
    user: userId,
    userAgent: req.headers["user-agent"] || null,
    ipAddress: req.ip || null,
    expiresAt,
  });
};

/**
 * Generate a cryptographically secure random token.
 * Returns both the raw token (to send in email) and its hash (to store in DB).
 */
export const generateSecureToken = () => {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
  return { rawToken, hashedToken };
};

/**
 * Hash a raw token using SHA-256 for safe database storage.
 */
export const hashToken = (rawToken) => {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
};

/**
 * Set access + refresh tokens as HTTP-only cookies.
 */
export const setAuthCookies = (res, accessToken, refreshToken) => {
  const isProduction = env.IS_PRODUCTION;

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "strict" : "lax",
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "strict" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

/**
 * Clear auth cookies on logout.
 */
export const clearAuthCookies = (res) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
};
