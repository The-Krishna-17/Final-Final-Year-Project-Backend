import { Router } from "express";
import * as userController from "../controllers/user.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route  PUT /api/v1/users/profile
 * @desc   Update user profile details
 * @access Private
 */
router.put("/profile", userController.updateProfile);

/**
 * @route  POST /api/v1/users/avatar
 * @desc   Upload user avatar
 * @access Private
 */
router.post("/avatar", userController.uploadAvatar);

/**
 * @route  POST /api/v1/users/deactivate
 * @desc   Deactivate current user account
 * @access Private
 */
router.post("/deactivate", userController.deactivateAccount);

export default router;
