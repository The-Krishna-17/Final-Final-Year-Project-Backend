import SkillProfile from "../models/SkillProfile.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  normalizeSkill,
  resolveAlias,
  categorizeSkill,
  generateSkillTags,
  generateSkillEmbedding,
  validateSkillInput,
} from "../utils/skillProcessor.js";

const getUserId = (req) => req.user?.id || req.user?._id;

// Internal helper to get or create profile
const getOrCreateProfile = async (userId) => {
  let profile = await SkillProfile.findOne({ user: userId });
  if (!profile) {
    profile = await SkillProfile.create({ user: userId });
  }
  return profile;
};

// Internal helper to process a skill
const processSkill = async (name, level) => {
  validateSkillInput(name, level);
  const rawNormalized = normalizeSkill(name);
  const normalizedName = resolveAlias(rawNormalized);
  const category = await categorizeSkill(normalizedName);
  const tags = generateSkillTags(normalizedName, category);
  const embedding = await generateSkillEmbedding(normalizedName);
  
  return {
    name: name.trim(),
    level,
    category,
    normalizedName,
    tags,
    embedding,
  };
};

/**
 * @desc   Add a skill user can OFFER
 * @route  POST /api/v1/skills/add-offer
 * @access Private
 */
export const addOfferSkill = asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  const { name, level } = req.body;

  const profile = await getOrCreateProfile(userId);

  const processedSkill = await processSkill(name, level || 3); // Default intermediate

  // Prevent duplicate normalized skills
  const isDuplicate = profile.offerSkills.some(
    (s) => s.normalizedName === processedSkill.normalizedName
  );
  if (isDuplicate) {
    throw ApiError.conflict(`You already have ${processedSkill.name} in your offered skills`);
  }

  // Max skill limit check
  if (profile.offerSkills.length >= 20) {
    throw ApiError.badRequest("You cannot add more than 20 offered skills");
  }

  profile.offerSkills.push(processedSkill);
  await profile.save();

  return ApiResponse.success(res, "Offered skill added successfully", { profile });
});

/**
 * @desc   Add a skill user WANTS to learn
 * @route  POST /api/v1/skills/add-want
 * @access Private
 */
export const addWantSkill = asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  const { name, level } = req.body; // level is optional, meaning current level before learning

  const profile = await getOrCreateProfile(userId);

  const processedSkill = await processSkill(name, level || 1); // Default beginner

  // Prevent duplicate normalized skills
  const isDuplicate = profile.wantSkills.some(
    (s) => s.normalizedName === processedSkill.normalizedName
  );
  if (isDuplicate) {
    throw ApiError.conflict(`You already have ${processedSkill.name} in your wanted skills`);
  }

  // Max skill limit check
  if (profile.wantSkills.length >= 20) {
    throw ApiError.badRequest("You cannot add more than 20 wanted skills");
  }

  profile.wantSkills.push(processedSkill);
  await profile.save();

  return ApiResponse.success(res, "Wanted skill added successfully", { profile });
});

/**
 * @desc   Update a skill (level)
 * @route  PUT /api/v1/skills/update
 * @access Private
 */
export const updateSkill = asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  const { skillId, listType, newLevel } = req.body; // listType: 'offer' | 'want'

  if (!skillId || !listType || !newLevel) {
    throw ApiError.badRequest("skillId, listType ('offer'/'want'), and newLevel are required");
  }
  if (newLevel < 1 || newLevel > 5) {
    throw ApiError.badRequest("Level must be between 1 and 5");
  }

  const profile = await SkillProfile.findOne({ user: userId });
  if (!profile) throw ApiError.notFound("Skill profile not found");

  const skillArray = listType === "offer" ? profile.offerSkills : profile.wantSkills;
  const skillIndex = skillArray.findIndex((s) => s._id.toString() === skillId);

  if (skillIndex === -1) {
    throw ApiError.notFound("Skill not found in the specified list");
  }

  skillArray[skillIndex].level = newLevel;
  await profile.save();

  return ApiResponse.success(res, "Skill updated successfully", { profile });
});

/**
 * @desc   Remove a skill
 * @route  DELETE /api/v1/skills/remove-skill
 * @access Private
 */
export const removeSkill = asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  const { skillId, listType } = req.body;

  if (!skillId || !listType) {
    throw ApiError.badRequest("skillId and listType ('offer'/'want') are required");
  }

  const profile = await SkillProfile.findOne({ user: userId });
  if (!profile) throw ApiError.notFound("Skill profile not found");

  if (listType === "offer") {
    profile.offerSkills = profile.offerSkills.filter((s) => s._id.toString() !== skillId);
  } else if (listType === "want") {
    profile.wantSkills = profile.wantSkills.filter((s) => s._id.toString() !== skillId);
  }

  await profile.save();

  return ApiResponse.success(res, "Skill removed successfully", { profile });
});

/**
 * @desc   Get a user's skill profile
 * @route  GET /api/v1/skills/user/:id
 * @access Private
 */
export const getUserSkills = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const profile = await SkillProfile.findOne({ user: id }).populate("user", "firstName lastName email avatar");
  
  if (!profile) {
    return ApiResponse.success(res, "Skill profile not found", { profile: null });
  }

  return ApiResponse.success(res, "Skill profile retrieved", { profile });
});
