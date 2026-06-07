import User from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * @desc   Update user profile (Name)
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const { firstName, lastName } = req.body;

  // We only update firstName and lastName
  const user = await User.findById(req.user.id || req.user._id);

  if (!user) {
    throw ApiError.notFound("User not found");
  }

  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;

  await user.save();

  return ApiResponse.success(res, "Profile updated successfully", { user });
});

/**
 * @desc   Upload/Update profile image using Base64
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
 */
export const deactivateAccount = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id || req.user._id);

  if (!user) {
    throw ApiError.notFound("User not found");
  }

  // Set lockUntil far in the future
  user.lockUntil = new Date("9999-12-31T23:59:59.000Z");
  await user.save();

  return ApiResponse.success(res, "Account deactivated successfully");
});
