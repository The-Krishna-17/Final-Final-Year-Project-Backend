import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  authLimiter,
  passwordLimiter,
} from "../middlewares/rateLimiter.middleware.js";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from "../validators/auth.validator.js";

const router = Router();

// ─── Public Routes ────────────────────────────────────────────────────────────

/**
 * @route  POST /api/v1/auth/register
 * @desc   Register a new user
 * @access Public
 */
router.post(
  "/register",
  authLimiter,
  validate(registerSchema),
  authController.register,
);

/**
 * @route  POST /api/v1/auth/login
 * @desc   Login with email and password
 * @access Public
 */
router.post("/login", authLimiter, validate(loginSchema), authController.login);

/**
 * @route  POST /api/v1/auth/refresh-token
 * @desc   Issue a new access token using a refresh token
 * @access Public (requires valid refresh token in cookie or body)
 */
router.post("/refresh-token", authController.refreshToken);

/**
 * @route  POST /api/v1/auth/forgot-password
 * @desc   Send a password reset email
 * @access Public
 */
router.post(
  "/forgot-password",
  passwordLimiter,
  validate(forgotPasswordSchema),
  authController.forgotPassword,
);

/**
 * @route  POST /api/v1/auth/reset-password/:token
 * @desc   Reset password using a secure token from email
 * @access Public
 */
router.post(
  "/reset-password/:token",
  passwordLimiter,
  validate(resetPasswordSchema),
  authController.resetPassword,
);

/**
 * @route  GET /api/v1/auth/verify-email/:token
 * @desc   Verify email address
 * @access Public
 */
router.get("/verify-email/:token", authController.verifyEmail);

// ─── Protected Routes ─────────────────────────────────────────────────────────

/**
 * @route  GET /api/v1/auth/me
 * @desc   Get the currently authenticated user's profile
 * @access Private
 */
router.get("/me", authenticate, authController.getMe);

/**
 * @route  POST /api/v1/auth/logout
 * @desc   Logout from the current device
 * @access Private
 */
router.post("/logout", authenticate, authController.logout);

/**
 * @route  POST /api/v1/auth/logout-all
 * @desc   Logout from all devices (revoke all refresh tokens)
 * @access Private
 */
router.post("/logout-all", authenticate, authController.logoutAll);

/**
 * @route  POST /api/v1/auth/change-password
 * @desc   Change user password while logged in
 * @access Private
 */
router.post(
  "/change-password",
  authenticate,
  passwordLimiter,
  validate(changePasswordSchema),
  authController.changePassword,
);

/**
 * @route  POST /api/v1/auth/resend-verification
 * @desc   Resend email verification link to authenticated user
 * @access Private
 */
router.post("/resend-verification", authenticate, authController.resendVerificationEmail);

export default router;
