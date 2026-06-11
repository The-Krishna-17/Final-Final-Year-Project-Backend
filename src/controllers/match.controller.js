import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import SkillProfile from "../models/SkillProfile.js";
import { calculateProfileMatch } from "../utils/matchingLogic.js";

const paginateArray = (array, page, limit) => {
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  return {
    matches: array.slice(startIndex, endIndex),
    pagination: {
      total: array.length,
      page,
      limit,
      totalPages: Math.ceil(array.length / limit),
    },
  };
};

/**
 * @desc   Get recommended skill matches
 * @route  GET /api/v1/matches/recommended
 * @access Private
 * @query  page - Page number (optional, default: 1)
 * @query  limit - Number of results per page (optional, default: 10)
 */

export const getRecommendedMatches = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;

  const myProfile = await SkillProfile.findOne({ user: userId });

  if (
    !myProfile ||
    !myProfile.wantSkills ||
    myProfile.wantSkills.length === 0
  ) {
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          "Add skills you want to learn to see recommendations.",
          { matches: [], pagination: {} },
        ),
      );
  }

  const allProfiles = await SkillProfile.find({
    user: { $ne: userId },
    availability: { $ne: "not_looking" },
  }).populate("user", "firstName lastName avatar currentWork bio role");

  const matches = allProfiles
    .map((profile) => calculateProfileMatch(myProfile, profile))
    .filter((match) => match.totalScore > 0)
    .sort((a, b) => b.totalScore - a.totalScore);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Recommended matches retrieved successfully",
        paginateArray(matches, page, limit),
      ),
    );
});

/**
 * @desc   Get mutual skill exchange matches
 * @route  GET /api/v1/matches/mutual
 * @access Private
 * @query  page - Page number (optional, default: 1)
 * @query  limit - Number of results per page (optional, default: 10)
 */

export const getMutualMatches = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;

  const myProfile = await SkillProfile.findOne({ user: userId });

  if (!myProfile) {
    return res.status(200).json(
      new ApiResponse(200, "Profile not found", {
        matches: [],
        pagination: {},
      }),
    );
  }

  /**
   * @desc   Search users by skill keywords
   * @route  GET /api/v1/matches/search
   * @access Private
   * @query  query - Skill name, keyword, or phrase
   * @query  page - Page number (optional)
   * @query  limit - Results per page (optional)
   */
  const allProfiles = await SkillProfile.find({
    user: { $ne: userId },
    availability: { $ne: "not_looking" },
  }).populate("user", "firstName lastName avatar currentWork bio role");

  const matches = allProfiles
    .map((profile) => calculateProfileMatch(myProfile, profile))
    .filter((match) => match.matchDetails.isMutual)
    .sort((a, b) => b.totalScore - a.totalScore);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Mutual matches retrieved successfully",
        paginateArray(matches, page, limit),
      ),
    );
});

/**
 * @desc   Filter matches by criteria
 * @route  GET /api/v1/matches/filter
 * @access Private
 * @query  mode - teach | learn | both
 * @query  availability - available | busy | not_looking
 * @query  domain - Skill domain/category
 * @query  minReputation - Minimum reputation score
 * @query  difficulty - beginner | intermediate | advanced
 * @query  page - Page number (optional)
 * @query  limit - Results per page (optional)
 */

export const searchMatches = asyncHandler(async (req, res) => {
  const { query } = req.query;
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;

  if (!query) {
    throw new ApiError(400, "Search query is required");
  }

  const userId = req.user.id;
  const myProfile = await SkillProfile.findOne({ user: userId });

  const dummyWantSkill = {
    primarySkill: { name: query },
    tokens: query.toLowerCase().split(" "),
  };

  const dummyProfile = {
    mode: myProfile?.mode || "both",
    wantSkills: [dummyWantSkill],
    offerSkills: myProfile?.offerSkills || [],
  };

  const allProfiles = await SkillProfile.find({
    user: { $ne: userId },
    availability: { $ne: "not_looking" },
  }).populate("user", "firstName lastName avatar currentWork bio role");

  const matches = allProfiles
    .map((profile) => calculateProfileMatch(dummyProfile, profile))
    .filter((match) => match.totalScore > 0)
    .sort((a, b) => b.totalScore - a.totalScore);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Search results retrieved",
        paginateArray(matches, page, limit),
      ),
    );
});

/**
 * @desc   Explain why a user is a good match
 * @route  GET /api/v1/matches/explain/:targetUserId
 * @access Private
 * @param  targetUserId - User ID of the target match
 */
export const filterMatches = asyncHandler(async (req, res) => {
  const { mode, availability, domain, minReputation, difficulty } = req.query;
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;

  const userId = req.user.id;
  const myProfile = await SkillProfile.findOne({ user: userId });

  const dbQuery = { user: { $ne: userId } };

  if (availability) dbQuery.availability = availability;
  else dbQuery.availability = { $ne: "not_looking" };

  if (mode && mode !== "both") dbQuery.mode = { $in: [mode, "both"] };
  if (minReputation) dbQuery.reputationScore = { $gte: Number(minReputation) };
  if (domain) dbQuery["offerSkills.domain"] = domain;
  if (difficulty) dbQuery["offerSkills.difficulty"] = difficulty;

  const allProfiles = await SkillProfile.find(dbQuery).populate(
    "user",
    "firstName lastName avatar currentWork bio role",
  );

  let matches = [];
  if (myProfile && myProfile.wantSkills?.length > 0) {
    matches = allProfiles
      .map((profile) => calculateProfileMatch(myProfile, profile))
      .sort((a, b) => b.totalScore - a.totalScore);
  } else {
    matches = allProfiles.map((profile) => ({
      profileId: profile._id,
      userId: profile.user._id,
      userProfile: profile,
      totalScore: 0,
      matchDetails: {},
    }));
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Filtered matches retrieved",
        paginateArray(matches, page, limit),
      ),
    );
});

// 5. Match Explanation
export const explainMatch = asyncHandler(async (req, res) => {
  const { targetUserId } = req.params;
  const userId = req.user.id;

  const myProfile = await SkillProfile.findOne({ user: userId });
  const targetProfile = await SkillProfile.findOne({
    user: targetUserId,
  }).populate("user", "firstName lastName avatar currentWork bio");

  if (!myProfile || !targetProfile) {
    throw new ApiError(404, "Profile not found");
  }

  const match = calculateProfileMatch(myProfile, targetProfile);

  return res
    .status(200)
    .json(new ApiResponse(200, "Match explanation generated", match));
});
