import crypto from "crypto";
import User from "../models/User.js";
import RefreshToken from "../models/RefreshToken.js";
import PasswordResetToken from "../models/PasswordResetToken.js";
import { ApiError } from "../utils/ApiError.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  createRefreshTokenRecord,
  generateSecureToken,
  hashToken,
} from "../utils/generateTokens.js";
import { sendEmail } from "./email.service.js";
import {
  welcomeEmailTemplate,
  emailVerificationTemplate,
  passwordResetTemplate,
  passwordChangedTemplate,
} from "../utils/emailTemplates.js";
import { env } from "../config/env.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const buildTokenPayload = (user) => ({
  userId: user._id.toString(),
  email: user.email,
  role: user.role,
});

const issueTokenPair = async (user, req) => {
  const payload = buildTokenPayload(user);
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);
  await createRefreshTokenRecord(user._id, refreshToken, req);
  return { accessToken, refreshToken };
};

// ─── Register ─────────────────────────────────────────────────────────────────

export const registerUser = async (dto, req) => {
  const { firstName, lastName, email, password } = dto;

  const existing = await User.findOne({ email });
  if (existing)
    throw ApiError.conflict("An account with this email already exists");

  const { rawToken, hashedToken } = generateSecureToken();

  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    emailVerificationToken: hashedToken,
    emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
  });

  const { accessToken, refreshToken } = await issueTokenPair(user, req);

  // Send emails (non-blocking — don't await)
  const verificationUrl = `${env.CLIENT_URL}/verify-email/${rawToken}`;
  sendEmail(user.email, welcomeEmailTemplate(user)).catch(console.error);
  sendEmail(user.email, emailVerificationTemplate(user, verificationUrl)).catch(
    console.error,
  );

  return { user, accessToken, refreshToken };
};

// ─── Login ────────────────────────────────────────────────────────────────────

export const loginUser = async (dto, req) => {
  const { email, password } = dto;

  // Explicitly select password and lockout fields
  const user = await User.findOne({ email }).select(
    "+password +loginAttempts +lockUntil",
  );
  if (!user) throw ApiError.unauthorized("Invalid email or password");

  // Account lockout check
  if (user.isLocked) {
    const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / 60000);
    throw ApiError.unauthorized(
      `Account is temporarily locked due to multiple failed login attempts. Try again in ${minutesLeft} minute(s).`,
    );
  }

  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    await user.incrementLoginAttempts();
    const attemptsLeft = 5 - (user.loginAttempts + 1);
    if (attemptsLeft <= 0) {
      throw ApiError.unauthorized(
        "Too many failed attempts. Account has been temporarily locked for 15 minutes.",
      );
    }
    throw ApiError.unauthorized(
      `Invalid email or password. ${attemptsLeft} attempt(s) remaining before lockout.`,
    );
  }

  // Successful login — reset lockout counters
  await user.resetLoginAttempts();

  const { accessToken, refreshToken } = await issueTokenPair(user, req);

  return { user, accessToken, refreshToken };
};

// ─── Refresh Token ────────────────────────────────────────────────────────────

export const refreshAccessToken = async (token, req) => {
  if (!token) throw ApiError.unauthorized("Refresh token is required");

  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch {
    throw ApiError.unauthorized("Invalid or expired refresh token");
  }

  const storedToken = await RefreshToken.findOne({ token, isRevoked: false });
  if (!storedToken || storedToken.expiresAt < new Date()) {
    throw ApiError.unauthorized("Refresh token is invalid or has been revoked");
  }

  const user = await User.findById(decoded.userId);
  if (!user) throw ApiError.unauthorized("User not found");

  // Rotate: revoke old, issue new
  storedToken.isRevoked = true;
  await storedToken.save();

  const { accessToken, refreshToken: newRefreshToken } = await issueTokenPair(
    user,
    req,
  );

  return { accessToken, refreshToken: newRefreshToken };
};

// ─── Logout ───────────────────────────────────────────────────────────────────

export const logoutUser = async (refreshToken) => {
  if (!refreshToken) return;
  await RefreshToken.findOneAndUpdate(
    { token: refreshToken },
    { isRevoked: true },
  );
};

export const logoutAllDevices = async (userId) => {
  await RefreshToken.updateMany(
    { user: userId, isRevoked: false },
    { isRevoked: true },
  );
};

// ─── Forgot Password ──────────────────────────────────────────────────────────

export const inititateForgotPassword = async (email) => {
  const user = await User.findOne({ email });

  // Always respond with success to prevent email enumeration attacks
  if (!user) return;

  // Invalidate any existing reset tokens
  await PasswordResetToken.deleteMany({ user: user._id });

  const { rawToken, hashedToken } = generateSecureToken();

  await PasswordResetToken.create({
    user: user._id,
    tokenHash: hashedToken,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
  });

  const resetUrl = `${env.CLIENT_URL}/reset-password/${rawToken}`;
  await sendEmail(user.email, passwordResetTemplate(user, resetUrl));
};

// ─── Reset Password ───────────────────────────────────────────────────────────

export const resetUserPassword = async (rawToken, newPassword) => {
  const hashedToken = hashToken(rawToken);

  const resetRecord = await PasswordResetToken.findOne({
    tokenHash: hashedToken,
    usedAt: null,
  });

  if (!resetRecord || resetRecord.expiresAt < new Date()) {
    throw ApiError.badRequest("Password reset token is invalid or has expired");
  }

  const user = await User.findById(resetRecord.user).select("+password");
  if (!user) throw ApiError.notFound("User not found");

  // Update password — pre-save hook will hash it
  user.password = newPassword;
  await user.save();

  // Mark token as used
  resetRecord.usedAt = new Date();
  await resetRecord.save();

  // Revoke all active sessions (force re-login on all devices)
  await RefreshToken.updateMany({ user: user._id }, { isRevoked: true });

  // Security notification
  sendEmail(user.email, passwordChangedTemplate(user)).catch(console.error);
};

// ─── Email Verification ───────────────────────────────────────────────────────

export const verifyUserEmail = async (rawToken) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: new Date() },
  }).select("+emailVerificationToken +emailVerificationExpires");

  if (!user)
    throw ApiError.badRequest(
      "Email verification token is invalid or has expired",
    );

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  return user;
};

// ─── Get Me ───────────────────────────────────────────────────────────────────

export const getUserProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound("User not found");
  return user;
};

// ─── Change Password ──────────────────────────────────────────────────────────

export const changeUserPassword = async (
  userId,
  currentPassword,
  newPassword,
) => {
  const user = await User.findById(userId).select("+password");
  if (!user) throw ApiError.notFound("User not found");

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) throw ApiError.badRequest("Incorrect current password");

  user.password = newPassword;
  await user.save();

  // Send security email
  sendEmail(user.email, passwordChangedTemplate(user)).catch(console.error);
};

// ─── Resend Verification Email ────────────────────────────────────────────────

export const resendVerificationEmail = async (userId) => {
  const user = await User.findById(userId).select(
    "+emailVerificationToken +emailVerificationExpires",
  );
  if (!user) throw ApiError.notFound("User not found");

  if (user.isEmailVerified) {
    throw ApiError.badRequest("Your email is already verified");
  }

  const { rawToken, hashedToken } = generateSecureToken();

  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
  await user.save();

  const verificationUrl = `${env.CLIENT_URL}/verify-email/${rawToken}`;
  sendEmail(user.email, emailVerificationTemplate(user, verificationUrl)).catch(console.error);
};
