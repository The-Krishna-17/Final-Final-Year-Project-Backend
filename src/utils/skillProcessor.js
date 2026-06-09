import Groq from "groq-sdk";

// ─────────────────────────────────────────────
// AI CLIENT
// ─────────────────────────────────────────────

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "missing",
});

// simple cache (replaces LRU)
const aiCache = new Map();
const CACHE_LIMIT = 500;

// ─────────────────────────────────────────────
// PROMPT BUILDER
// ─────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a skill extraction engine for a peer-to-peer skill swap platform.
Your ONLY job is to extract structured skill data from natural language.

STRICT RULES:
- "primarySkill" must be a SHORT skill name (1-4 words max), NOT a sentence. Examples: "React", "JWT Authentication", "Data Scraping", "Python", "Guitar".
- "domain" must be one of: Frontend Development, Backend Development, Data Science, Mobile Development, DevOps, Design, Music, Languages, Business, Creative Arts, Health & Fitness, Cooking, Finance, Content Creation, General.
- "topics" must be 2-5 specific sub-topics or concepts, each 1-4 words.
- "technologies" must be specific tools, languages, or libraries mentioned or strongly implied.
- "difficulty" must be EXACTLY one of: Beginner, Intermediate, Advanced.
- Return ONLY valid JSON — no markdown, no explanation, no code fences.`;

const buildPrompt = (input) => `Extract skill data from this user input:
"${input}"

Return ONLY this JSON structure with real values (no placeholders):
{
  "domain": "<domain>",
  "primarySkill": "<core skill name, 1-4 words>",
  "topics": ["<topic1>", "<topic2>"],
  "technologies": ["<tech1>", "<tech2>"],
  "difficulty": "<Beginner|Intermediate|Advanced>"
}`;

// ─────────────────────────────────────────────
// AI EXTRACTION
// ─────────────────────────────────────────────

export const enrichSkillAI = async (rawInput) => {
  if (aiCache.has(rawInput)) {
    return aiCache.get(rawInput);
  }

  const res = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    temperature: 0.1,
    max_tokens: 256,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildPrompt(rawInput) },
    ],
  });

  let text = res.choices[0].message.content;

  // clean possible markdown fences
  text = text.replace(/```json|```/g, "").trim();

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (err) {
    throw new Error("AI returned invalid JSON");
  }

  // cache cleanup (simple LRU-like behavior)
  if (aiCache.size > CACHE_LIMIT) {
    const firstKey = aiCache.keys().next().value;
    aiCache.delete(firstKey);
  }

  aiCache.set(rawInput, parsed);

  return parsed;
};

// ─────────────────────────────────────────────
// VALIDATION
// ─────────────────────────────────────────────

export const validateSkillInput = (rawInput) => {
  if (!rawInput || typeof rawInput !== "string") {
    throw new Error("Input is required and must be a string.");
  }
  const trimmed = rawInput.trim();
  if (trimmed.length < 2) throw new Error("Input must be at least 2 characters.");
  if (trimmed.length > 300) throw new Error("Input must be 300 characters or fewer.");
};

// ─────────────────────────────────────────────
// FULL PIPELINE
// ─────────────────────────────────────────────

export const processSkill = async (rawInput) => {
  // 1. Validate
  validateSkillInput(rawInput);

  // 2. AI extraction
  let extracted;
  try {
    extracted = await enrichSkillAI(rawInput.trim());
  } catch (err) {
    console.error("[skillProcessor] AI extraction failed:", err.message);
    // Graceful fallback so the skill is still saved
    extracted = {
      domain: "General",
      primarySkill: rawInput.trim(),
      topics: [],
      technologies: [],
      difficulty: "Beginner",
    };
  }

  // 3. Normalise primarySkill value (AI may return a string or object)
  const primaryName =
    typeof extracted.primarySkill === "string"
      ? extracted.primarySkill.trim()
      : extracted.primarySkill?.name?.trim() || rawInput.trim();

  const primaryCategory = extracted.domain ? extracted.domain.trim() : "Other";

  // 4. Normalise difficulty
  const validDifficulties = ["Beginner", "Intermediate", "Advanced"];
  const rawDiff = extracted.difficulty || "Beginner";
  const diff = rawDiff.charAt(0).toUpperCase() + rawDiff.slice(1).toLowerCase();
  const difficulty = validDifficulties.includes(diff) ? diff : "Beginner";

  // 5. Build search tokens
  const topics = Array.isArray(extracted.topics) ? extracted.topics.map(String) : [];
  const technologies = Array.isArray(extracted.technologies) ? extracted.technologies.map(String) : [];

  const tokenSet = new Set([
    primaryName.toLowerCase(),
    ...(extracted.domain ? [extracted.domain.toLowerCase()] : []),
    ...topics.map((t) => t.toLowerCase()),
    ...technologies.map((t) => t.toLowerCase()),
    difficulty.toLowerCase(),
  ]);

  return {
    rawInput: rawInput.trim(),
    domain: extracted.domain || "General",
    primarySkill: {
      name: primaryName,
      category: primaryCategory,
    },
    topics,
    technologies,
    difficulty,
    tokens: [...tokenSet].filter(Boolean),
    processedAt: new Date(),
  };
};
