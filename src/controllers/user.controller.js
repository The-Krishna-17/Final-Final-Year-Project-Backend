import User from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// ─── Allowed social link platforms ───────────────────────────────────────────
const ALLOWED_SOCIAL_KEYS = ["linkedin", "github", "twitter", "instagram", "website", "facebook"];

/**
 * @desc   Get the authenticated user's full profile
 * @route  GET /api/v1/users/profile
 */
export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id || req.user._id);

  if (!user) {
    throw ApiError.notFound("User not found");
  }

  return ApiResponse.success(res, "Profile fetched successfully", { user });
});

/**
 * @desc   Update user profile
 *         Accepts: firstName, lastName, bio, currentWork,
 *                  workExperience (full array replace), socialLinks (partial merge)
 * @route  PUT /api/v1/users/profile
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const {
    firstName,
    lastName,
    bio,
    currentWork,
    workExperience,
    socialLinks,
  } = req.body;

  const user = await User.findById(req.user.id || req.user._id);

  if (!user) {
    throw ApiError.notFound("User not found");
  }

  // ── Scalar fields ────────────────────────────────────────────────────────
  if (firstName !== undefined) user.firstName = firstName;
  if (lastName !== undefined) user.lastName = lastName;
  if (bio !== undefined) user.bio = bio;
  if (currentWork !== undefined) user.currentWork = currentWork;

  // ── Work experience – full replace ───────────────────────────────────────
  if (workExperience !== undefined) {
    if (!Array.isArray(workExperience)) {
      throw ApiError.badRequest("workExperience must be an array");
    }
    user.workExperience = workExperience;
  }

  // ── Social links – partial merge (only provided keys are updated) ─────────
  if (socialLinks !== undefined && typeof socialLinks === "object") {
    if (!user.socialLinks) user.socialLinks = {};
    for (const key of ALLOWED_SOCIAL_KEYS) {
      if (key in socialLinks) {
        user.socialLinks[key] = socialLinks[key] || null;
      }
    }
    user.markModified("socialLinks"); // nested object needs explicit mark
  }

  await user.save();

  return ApiResponse.success(res, "Profile updated successfully", { user });
});

/**
 * @desc   Upload/Update profile image using Base64
 * @route  POST /api/v1/users/avatar
 */
export const uploadAvatar = asyncHandler(async (req, res) => {
  const { avatar } = req.body;

  if (!avatar) {
    throw ApiError.badRequest("Please provide an avatar image");
  }

  const user = await User.findById(req.user.id || req.user._id);

  if (!user) {
    throw ApiError.notFound("User not found");
  }

  user.avatar = avatar;
  await user.save();

  return ApiResponse.success(res, "Avatar updated successfully", { user });
});

/**
 * @desc   Deactivate account
 * @route  POST /api/v1/users/deactivate
 */
export const deactivateAccount = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id || req.user._id);

  if (!user) {
    throw ApiError.notFound("User not found");
  }

  // Set lockUntil far in the future to permanently lock the account
  user.lockUntil = new Date("9999-12-31T23:59:59.000Z");
  await user.save();

  return ApiResponse.success(res, "Account deactivated successfully");
});

