import { verifyAccessToken } from "../utils/generateTokens.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/User.js";

/**
 * Authenticate requests using JWT from Authorization header or cookies.
 */
export const authenticate = asyncHandler(async (req, res, next) => {
  // Extract token from Authorization header or cookie
  let token = req.cookies?.accessToken;

  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  if (!token) {
    throw ApiError.unauthorized("Access token is required");
  }

  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      throw ApiError.unauthorized("Access token has expired");
    }
    throw ApiError.unauthorized("Invalid access token");
  }

  const user = await User.findById(decoded.userId).select("-password");
  if (!user) {
    throw ApiError.unauthorized("User no longer exists");
  }

  // Attach user and token payload to request
  req.user = user;
  req.tokenPayload = decoded;
  next();
});

/**
 * Authorize based on user roles.
 *
 * @param {...string} roles - Allowed roles
 */
export const authorize = (...roles) =>
  asyncHandler(async (req, res, next) => {
    if (!req.user) throw ApiError.unauthorized();

    if (!roles.includes(req.user.role)) {
      throw ApiError.forbidden("You do not have permission to perform this action");
    }

    next();
  });
