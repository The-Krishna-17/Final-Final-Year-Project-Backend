import { Router } from "express";
import * as skillController from "../controllers/skill.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

// All skill routes require authentication
router.use(authenticate);

/**
 * @route  POST /api/v1/skills/add-offer
 * @desc   Add a skill user can OFFER
 * @access Private
 */
router.post("/add-offer", skillController.addOfferSkill);

/**
 * @route  POST /api/v1/skills/add-want
 * @desc   Add a skill user WANTS to learn
 * @access Private
 */
router.post("/add-want", skillController.addWantSkill);

/**
 * @route  PUT /api/v1/skills/update
 * @desc   Update a skill (level)
 * @access Private
 */
router.put("/update", skillController.updateSkill);

/**
 * @route  DELETE /api/v1/skills/remove-skill
 * @desc   Remove a skill
 * @access Private
 */
router.delete("/remove-skill", skillController.removeSkill);

/**
 * @route  GET /api/v1/skills/user/:id
 * @desc   Get a user's skill profile
 * @access Private
 */
router.get("/user/:id", skillController.getUserSkills);

export default router;
