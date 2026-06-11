// backend/src/utils/matchingLogic.js

/**
 * Calculate compatibility between a specific "Want" skill and an "Offer" skill.
 * 
 * @param {Object} wantSkill - The skill the user wants to learn.
 * @param {Object} offerSkill - The skill the potential match offers.
 * @returns {Object} Score breakdown and total score.
 */
export const calculateSkillMatchScore = (wantSkill, offerSkill) => {
  let score = 0;
  const breakdown = {
    directMatch: 0,
    tokenSimilarity: 0,
    domainSimilarity: 0,
    difficultyBonus: 0,
  };

  // 1. Direct Skill Match (Highest weight: 50 points)
  const wantName = wantSkill.primarySkill?.name?.toLowerCase() || "";
  const offerName = offerSkill.primarySkill?.name?.toLowerCase() || "";
  
  if (wantName && offerName) {
    if (wantName === offerName) {
      breakdown.directMatch = 50;
      score += 50;
    } else if (wantName.includes(offerName) || offerName.includes(wantName)) {
      breakdown.directMatch = 30;
      score += 30;
    }
  }

  // 2. Token Similarity (Semantic AI matching: max 30 points)
  const wantTokens = new Set(wantSkill.tokens || []);
  const offerTokens = new Set(offerSkill.tokens || []);
  let intersectionCount = 0;
  for (const token of wantTokens) {
    if (offerTokens.has(token)) intersectionCount++;
  }
  
  // Calculate Jaccard-like similarity or just flat token overlap
  if (wantTokens.size > 0 && offerTokens.size > 0) {
    const overlapPercentage = intersectionCount / Math.max(wantTokens.size, offerTokens.size);
    const tokenScore = Math.round(overlapPercentage * 30);
    breakdown.tokenSimilarity = tokenScore;
    score += tokenScore;
  }

  // 3. Domain Similarity (Boost: 10 points)
  if (wantSkill.domain && offerSkill.domain && wantSkill.domain === offerSkill.domain) {
    breakdown.domainSimilarity = 10;
    score += 10;
  }

  // 4. Difficulty Compatibility (Max 10 points)
  // Beginner <-> Intermediate = best (10 pts)
  // Beginner <-> Advanced = mentor mode bonus (8 pts)
  // Same difficulty = (5 pts)
  const wDiff = wantSkill.difficulty || "Beginner";
  const oDiff = offerSkill.difficulty || "Beginner";
  
  if (wDiff === "Beginner" && oDiff === "Intermediate") {
    breakdown.difficultyBonus = 10;
  } else if (wDiff === "Beginner" && oDiff === "Advanced") {
    breakdown.difficultyBonus = 8;
  } else if (wDiff === "Intermediate" && oDiff === "Advanced") {
    breakdown.difficultyBonus = 10;
  } else if (wDiff === oDiff) {
    breakdown.difficultyBonus = 5;
  } else {
    // Advanced learning from Beginner? Unlikely to be a good match.
    breakdown.difficultyBonus = 0;
  }
  score += breakdown.difficultyBonus;

  return { total: score, breakdown };
};

/**
 * Compare User A's wants against User B's offers.
 */
export const calculateOneWayMatch = (userAWants, userBOffers) => {
  let bestScore = 0;
  let bestBreakdown = null;
  let matchedWant = null;
  let matchedOffer = null;

  if (!userAWants || !userBOffers) return null;

  for (const want of userAWants) {
    for (const offer of userBOffers) {
      const match = calculateSkillMatchScore(want, offer);
      if (match.total > bestScore) {
        bestScore = match.total;
        bestBreakdown = match.breakdown;
        matchedWant = want;
        matchedOffer = offer;
      }
    }
  }

  return {
    score: bestScore,
    breakdown: bestBreakdown,
    wantSkill: matchedWant,
    offerSkill: matchedOffer,
  };
};

/**
 * Full match score between User A and User B
 */
export const calculateProfileMatch = (profileA, profileB) => {
  let totalScore = 0;
  const matchDetails = {};

  // One-way: A wants, B offers
  const aWantsBMatch = calculateOneWayMatch(profileA.wantSkills, profileB.offerSkills);
  // One-way: B wants, A offers
  const bWantsAMatch = calculateOneWayMatch(profileB.wantSkills, profileA.offerSkills);

  // If calculating recommended (A wants, B offers)
  if (aWantsBMatch) {
    totalScore += aWantsBMatch.score;
    matchDetails.aWantsB = aWantsBMatch;
  }

  // If calculating mutual (B wants, A offers)
  if (bWantsAMatch) {
    totalScore += bWantsAMatch.score;
    matchDetails.bWantsA = bWantsAMatch;
    matchDetails.isMutual = aWantsBMatch.score > 20 && bWantsAMatch.score > 20;
    
    // Mutual match bonus
    if (matchDetails.isMutual) {
      totalScore += 20;
    }
  } else {
    matchDetails.isMutual = false;
  }

  // 5. Reputation Boost (Max 15 points)
  // higher reputation gives a slight boost to ranking
  const repBoost = Math.min((profileB.reputationScore || 0) * 0.5, 15);
  totalScore += repBoost;
  matchDetails.reputationBoost = repBoost;

  // 6. Mode Compatibility
  const aMode = profileA.mode || "both";
  const bMode = profileB.mode || "both";
  let modeCompatible = false;
  
  if (aMode === "both" || bMode === "both") {
    modeCompatible = true;
  } else if (aMode === bMode) {
    modeCompatible = true;
  }
  
  if (!modeCompatible) {
    // Penalty if modes don't match
    totalScore *= 0.5;
  }
  matchDetails.modeCompatible = modeCompatible;

  // Calculate match percentage dynamically based on match type
  const maxScore = matchDetails.isMutual ? 235 : 115;
  const matchPercent = Math.min(100, Math.round((totalScore / maxScore) * 100));

  return {
    profileId: profileB._id,
    userId: profileB.user?._id || profileB.user,
    userProfile: profileB,
    totalScore: Math.round(totalScore),
    matchPercent,
    matchDetails,
  };
};
