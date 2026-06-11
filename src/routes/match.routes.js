import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import {
  getRecommendedMatches,
  getMutualMatches,
  searchMatches,
  filterMatches,
  explainMatch,
} from "../controllers/match.controller.js";

const router = Router();

// All match routes require authentication
router.use(authenticate);

/**
 * @route  GET /api/v1/matches/recommended
 * @desc   Get AI-ranked recommended skill swap matches
 * @access Private
 */
router.get("/recommended", getRecommendedMatches);

/**
 * @route  GET /api/v1/matches/mutual
 * @desc   Get users where both parties can help each other
 * @access Private
 */
router.get("/mutual", getMutualMatches);

/**
 * @route  GET /api/v1/matches/search
 * @desc   Search users by skill, name, category, or keyword
 * @access Private
 */
router.get("/search", searchMatches);

/**
 * @route  GET /api/v1/matches/filter
 * @desc   Filter matches by skills, level, category, location, etc.
 * @access Private
 */
router.get("/filter", filterMatches);

/**
 * @route  GET /api/v1/matches/explain/:targetUserId
 * @desc   Explain why a specific user is a good match
 * @access Private
 */
router.get("/explain/:targetUserId", explainMatch);

export default router;
