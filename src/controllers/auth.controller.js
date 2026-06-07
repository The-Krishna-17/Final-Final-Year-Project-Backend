import * as authService from "../services/auth.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { setAuthCookies, clearAuthCookies } from "../utils/generateTokens.js";

// ─── Register ─────────────────────────────────────────────────────────────────

export const register = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.registerUser(req.body, req);

  setAuthCookies(res, accessToken, refreshToken);

  return ApiResponse.created(res, "Account created successfully", {
    user,
    accessToken,
  });
});

// ─── Login ────────────────────────────────────────────────────────────────────

export const login = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.loginUser(req.body, req);

  setAuthCookies(res, accessToken, refreshToken);

  return ApiResponse.success(res, "Login successful", {
    user,
    accessToken,
  });
});

// ─── Refresh Token ────────────────────────────────────────────────────────────

export const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;
  const { accessToken, refreshToken: newRefreshToken } = await authService.refreshAccessToken(token, req);

  setAuthCookies(res, accessToken, newRefreshToken);

  return ApiResponse.success(res, "Tokens refreshed successfully", { accessToken });
});

// ─── Logout ───────────────────────────────────────────────────────────────────

export const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;
  await authService.logoutUser(token);
  clearAuthCookies(res);
  return ApiResponse.success(res, "Logged out successfully");
});

export const logoutAll = asyncHandler(async (req, res) => {
  await authService.logoutAllDevices(req.user._id);
  clearAuthCookies(res);
  return ApiResponse.success(res, "Logged out from all devices successfully");
});

// ─── Forgot Password ──────────────────────────────────────────────────────────

export const forgotPassword = asyncHandler(async (req, res) => {
  await authService.inititateForgotPassword(req.body.email);
  // Always return success to prevent email enumeration
  return ApiResponse.success(
    res,
    "If an account with that email exists, a password reset link has been sent."
  );
});

// ─── Reset Password ───────────────────────────────────────────────────────────

export const resetPassword = asyncHandler(async (req, res) => {
  await authService.resetUserPassword(req.params.token, req.body.password);
  return ApiResponse.success(res, "Password reset successful. Please log in with your new password.");
});

// ─── Email Verification ───────────────────────────────────────────────────────

export const verifyEmail = asyncHandler(async (req, res) => {
  await authService.verifyUserEmail(req.params.token);
  return ApiResponse.success(res, "Email verified successfully. You can now log in.");
});

// ─── Get Current User ─────────────────────────────────────────────────────────

export const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getUserProfile(req.user._id);
  return ApiResponse.success(res, "Profile retrieved successfully", { user });
});

// ─── Change Password ──────────────────────────────────────────────────────────

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  await authService.changeUserPassword(req.user._id, currentPassword, newPassword);
  return ApiResponse.success(res, "Password changed successfully");
});

// ─── Resend Verification Email ────────────────────────────────────────────────

export const resendVerificationEmail = asyncHandler(async (req, res) => {
  await authService.resendVerificationEmail(req.user._id);
  return ApiResponse.success(res, "Verification email sent. Please check your inbox.");
});

