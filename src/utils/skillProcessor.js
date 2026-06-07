// Use native fetch instead of node-fetch in Node 22+

// ─────────────────────────────────────────────────────────────
// 1. NORMALIZATION
// ─────────────────────────────────────────────────────────────
export const normalizeSkill = (name) => {
  if (!name || typeof name !== "string") return "";

  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9+#.\s\-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
};

// ─────────────────────────────────────────────────────────────
// 2. ALIAS MAP  →  canonical skill name
//    Prevents "js" / "javascript" / "node" / "nodejs" splits
// ─────────────────────────────────────────────────────────────
const SKILL_ALIASES = {
  // Tech
  js: "javascript",
  "node.js": "nodejs",
  node: "nodejs",
  "react.js": "react",
  reactjs: "react",
  "vue.js": "vuejs",
  "next.js": "nextjs",
  "nuxt.js": "nuxtjs",
  ts: "typescript",
  py: "python",
  rb: "ruby",
  golang: "go",
  k8s: "kubernetes",
  "c++": "cpp",
  "c#": "csharp",
  ".net": "dotnet",
  "asp.net": "dotnet",
  aws: "amazon web services",
  gcp: "google cloud platform",
  psql: "postgresql",
  postgres: "postgresql",
  mongo: "mongodb",
  "machine learning": "ml",
  "deep learning": "dl",
  "artificial intelligence": "ai",
  "natural language processing": "nlp",
  cv: "computer vision",
  // Design
  figma: "figma",
  "adobe xd": "ux design",
  photoshop: "adobe photoshop",
  illustrator: "adobe illustrator",
  premiere: "adobe premiere",
  // Languages
  "mandarin chinese": "mandarin",
  chinese: "mandarin",
  bahasa: "indonesian",
  // Music
  "electric guitar": "guitar",
  "acoustic guitar": "guitar",
  drums: "drumming",
  "drum kit": "drumming",
  daw: "music production",
  ableton: "music production",
  "fl studio": "music production",
  // Fitness
  "weight training": "weightlifting",
  "weight lifting": "weightlifting",
  cardio: "fitness training",
  hiit: "fitness training",
  // Cooking
  baking: "baking & pastry",
  pastry: "baking & pastry",
};

export const resolveAlias = (normalizedName) =>
  SKILL_ALIASES[normalizedName] ?? normalizedName;

// ─────────────────────────────────────────────────────────────
// 3. TAXONOMY
//    category → skills[]
//    Covers what people realistically learn on a P2P platform
// ─────────────────────────────────────────────────────────────
export const SKILL_TAXONOMY = {
  Technology: [
    "javascript",
    "typescript",
    "python",
    "java",
    "go",
    "rust",
    "cpp",
    "csharp",
    "php",
    "swift",
    "kotlin",
    "ruby",
    "scala",
    "r",
    "react",
    "vuejs",
    "angular",
    "nextjs",
    "nuxtjs",
    "svelte",
    "nodejs",
    "django",
    "fastapi",
    "spring boot",
    "laravel",
    "express",
    "postgresql",
    "mongodb",
    "redis",
    "mysql",
    "sqlite",
    "firebase",
    "docker",
    "kubernetes",
    "terraform",
    "ansible",
    "amazon web services",
    "google cloud platform",
    "azure",
    "linux",
    "bash scripting",
    "git",
    "ci/cd",
    "rest api",
    "graphql",
    "websockets",
    "cybersecurity",
    "ethical hacking",
    "networking",
    "arduino",
    "raspberry pi",
    "embedded systems",
    "solidity",
    "web3",
    "smart contracts",
  ],

  Design: [
    "ui design",
    "ux design",
    "product design",
    "interaction design",
    "figma",
    "adobe photoshop",
    "adobe illustrator",
    "adobe xd",
    "adobe premiere",
    "after effects",
    "blender",
    "cinema 4d",
    "graphic design",
    "brand design",
    "logo design",
    "typography",
    "motion graphics",
    "3d modeling",
    "animation",
    "web design",
    "mobile design",
    "design systems",
    "user research",
    "prototyping",
    "wireframing",
    "print design",
    "packaging design",
  ],

  "Data & AI": [
    "ml",
    "dl",
    "nlp",
    "computer vision",
    "data analysis",
    "data visualization",
    "data engineering",
    "pandas",
    "numpy",
    "scikit-learn",
    "tensorflow",
    "pytorch",
    "sql",
    "tableau",
    "power bi",
    "excel advanced",
    "statistics",
    "probability",
    "linear algebra",
    "llm fine-tuning",
    "prompt engineering",
    "rag systems",
    "spark",
    "airflow",
    "dbt",
  ],

  Business: [
    "entrepreneurship",
    "startup strategy",
    "business planning",
    "product management",
    "project management",
    "scrum",
    "agile",
    "digital marketing",
    "seo",
    "sem",
    "content marketing",
    "email marketing",
    "social media marketing",
    "influencer marketing",
    "growth hacking",
    "sales",
    "b2b sales",
    "cold outreach",
    "crm",
    "accounting",
    "bookkeeping",
    "financial modelling",
    "hr management",
    "recruitment",
    "leadership",
    "supply chain",
    "operations management",
    "legal basics",
    "contract writing",
    "e-commerce",
    "dropshipping",
    "amazon fba",
  ],

  Languages: [
    "english",
    "mandarin",
    "spanish",
    "arabic",
    "french",
    "german",
    "japanese",
    "korean",
    "portuguese",
    "italian",
    "russian",
    "hindi",
    "urdu",
    "bengali",
    "turkish",
    "dutch",
    "swedish",
    "polish",
    "indonesian",
    "thai",
    "sign language",
    "nepali",
    "tamil",
    "swahili",
  ],

  Academic: [
    "mathematics",
    "calculus",
    "linear algebra",
    "statistics",
    "physics",
    "chemistry",
    "biology",
    "economics",
    "history",
    "philosophy",
    "psychology",
    "sociology",
    "essay writing",
    "research methodology",
    "academic writing",
    "ielts preparation",
    "sat preparation",
    "gre preparation",
    "literature",
    "political science",
  ],

  "Creative Arts": [
    "drawing",
    "sketching",
    "watercolour",
    "oil painting",
    "digital art",
    "illustration",
    "comic art",
    "calligraphy",
    "hand lettering",
    "photography",
    "portrait photography",
    "street photography",
    "photo editing",
    "lightroom",
    "darkroom photography",
    "filmmaking",
    "video editing",
    "screenwriting",
    "creative writing",
    "fiction writing",
    "poetry",
    "sculpture",
    "ceramics",
    "printmaking",
    "fashion design",
    "jewellery making",
    "embroidery",
  ],

  Music: [
    "guitar",
    "piano",
    "violin",
    "drumming",
    "bass guitar",
    "ukulele",
    "cello",
    "flute",
    "saxophone",
    "trumpet",
    "singing",
    "vocal training",
    "choir",
    "music theory",
    "music composition",
    "music production",
    "djing",
    "beatmaking",
    "audio engineering",
    "mixing & mastering",
    "classical music",
    "jazz",
    "music notation",
  ],

  Trades: [
    "plumbing",
    "electrical wiring",
    "carpentry",
    "welding",
    "tiling",
    "plastering",
    "painting & decorating",
    "hvac",
    "solar panel installation",
    "landscaping",
    "car mechanics",
    "motorcycle repair",
    "bicycle repair",
    "sewing & tailoring",
    "upholstery",
    "shoe repair",
    "3d printing",
    "cnc machining",
    "woodworking",
  ],

  "Health & Fitness": [
    "personal training",
    "weightlifting",
    "yoga",
    "pilates",
    "meditation",
    "breathwork",
    "martial arts",
    "boxing",
    "rock climbing",
    "swimming coaching",
    "running coaching",
    "nutrition coaching",
    "meal planning",
    "physiotherapy basics",
    "first aid",
    "mental health first aid",
    "sports coaching",
  ],

  Cooking: [
    "italian cooking",
    "asian cooking",
    "middle eastern cooking",
    "baking & pastry",
    "bread making",
    "cake decorating",
    "vegan cooking",
    "raw food",
    "fermentation",
    "meal prep",
    "knife skills",
    "food plating",
    "barista skills",
    "cocktail making",
    "wine pairing",
  ],

  Lifestyle: [
    "interior design",
    "home organisation",
    "minimalism",
    "gardening",
    "urban farming",
    "beekeeping",
    "travel planning",
    "budgeting",
    "personal finance basics",
    "parenting skills",
    "homeschooling",
    "sustainable living",
    "zero waste",
    "upcycling",
    "chess",
    "poker strategy",
    "knitting & crocheting",
    "origami",
    "calligraphy",
  ],

  Communication: [
    "public speaking",
    "presentation skills",
    "storytelling",
    "negotiation",
    "conflict resolution",
    "active listening",
    "coaching",
    "mentoring",
    "facilitation",
    "business writing",
    "copywriting",
    "technical writing",
  ],

  Finance: [
    "personal budgeting",
    "investing basics",
    "stock market",
    "crypto basics",
    "real estate investing",
    "tax planning",
    "retirement planning",
    "financial modelling",
    "excel for finance",
    "trading strategies",
  ],

  "Content Creation": [
    "youtube content",
    "podcast production",
    "tiktok content",
    "instagram reels",
    "short-form video",
    "long-form writing",
    "newsletter writing",
    "blog writing",
    "ghostwriting",
    "video scripting",
    "thumbnail design",
  ],
};

// ─────────────────────────────────────────────────────────────
// 4. REVERSE LOOKUP  →  skill → category (O(1))
// ─────────────────────────────────────────────────────────────
const skillToCategoryMap = Object.entries(SKILL_TAXONOMY).reduce(
  (acc, [category, skills]) => {
    skills.forEach((skill) => (acc[skill] = category));
    return acc;
  },
  {},
);

// ─────────────────────────────────────────────────────────────
// 5. TAGS  →  fine-grained labels for matching engine
//    Multiple tags per skill boost cross-category matches
//    e.g. "python" matches both "backend" and "data" seekers
// ─────────────────────────────────────────────────────────────
const SKILL_TAGS = {
  // ── Technology ──────────────────────────────────────────
  javascript: ["programming", "frontend", "backend", "web"],
  typescript: ["programming", "frontend", "backend", "web", "typed"],
  python: ["programming", "backend", "data", "automation", "scripting"],
  java: ["programming", "backend", "enterprise", "oop"],
  go: ["programming", "backend", "systems", "performance"],
  rust: ["programming", "systems", "performance", "memory-safe"],
  cpp: ["programming", "systems", "performance", "game-dev"],
  csharp: ["programming", "backend", "game-dev", "enterprise"],
  php: ["programming", "backend", "web"],
  swift: ["programming", "mobile", "ios"],
  kotlin: ["programming", "mobile", "android"],
  ruby: ["programming", "backend", "web"],
  scala: ["programming", "backend", "data", "functional"],
  r: ["programming", "data", "statistics"],
  react: ["frontend", "web", "ui", "component-based"],
  vuejs: ["frontend", "web", "ui", "component-based"],
  angular: ["frontend", "web", "ui", "enterprise"],
  nextjs: ["frontend", "web", "fullstack", "ssr"],
  nuxtjs: ["frontend", "web", "fullstack", "ssr"],
  svelte: ["frontend", "web", "ui"],
  nodejs: ["backend", "web", "javascript", "api"],
  django: ["backend", "web", "python", "api"],
  fastapi: ["backend", "web", "python", "api", "performance"],
  "spring boot": ["backend", "java", "enterprise", "api"],
  laravel: ["backend", "web", "php", "api"],
  express: ["backend", "web", "nodejs", "api"],
  postgresql: ["database", "sql", "backend", "relational"],
  mongodb: ["database", "nosql", "backend"],
  redis: ["database", "caching", "backend", "performance"],
  mysql: ["database", "sql", "backend", "relational"],
  firebase: ["database", "backend", "cloud", "realtime"],
  docker: ["devops", "containerisation", "cloud", "deployment"],
  kubernetes: ["devops", "orchestration", "cloud", "scalability"],
  terraform: ["devops", "infrastructure", "cloud", "iac"],
  "amazon web services": ["cloud", "devops", "infrastructure"],
  "google cloud platform": ["cloud", "devops", "infrastructure"],
  azure: ["cloud", "devops", "infrastructure", "enterprise"],
  linux: ["os", "systems", "devops", "scripting"],
  "bash scripting": ["scripting", "automation", "devops", "linux"],
  git: ["version-control", "collaboration", "devops"],
  "ci/cd": ["devops", "automation", "deployment"],
  "rest api": ["api", "backend", "web", "integration"],
  graphql: ["api", "backend", "web", "data-fetching"],
  websockets: ["api", "realtime", "backend", "web"],
  cybersecurity: ["security", "networking", "ethical-hacking"],
  "ethical hacking": ["security", "penetration-testing", "networking"],
  networking: ["infrastructure", "systems", "devops", "security"],
  arduino: ["hardware", "iot", "electronics", "embedded"],
  "raspberry pi": ["hardware", "iot", "electronics", "linux"],
  "embedded systems": ["hardware", "electronics", "programming", "iot"],
  solidity: ["blockchain", "web3", "programming", "smart-contracts"],
  web3: ["blockchain", "crypto", "decentralised"],
  "smart contracts": ["blockchain", "solidity", "web3"],

  // ── Design ───────────────────────────────────────────────
  "ui design": ["design", "visual", "digital", "product"],
  "ux design": ["design", "research", "product", "user-centred"],
  "product design": ["design", "digital", "product", "strategy"],
  figma: ["design", "tool", "ui", "prototyping"],
  "adobe photoshop": ["design", "image-editing", "creative", "digital"],
  "adobe illustrator": ["design", "vector", "illustration", "creative"],
  "graphic design": ["design", "visual", "creative", "print"],
  "brand design": ["design", "marketing", "identity", "visual"],
  "motion graphics": ["design", "animation", "video", "creative"],
  "3d modeling": ["design", "3d", "creative", "technical"],
  "web design": ["design", "frontend", "visual", "digital"],
  "user research": ["ux", "research", "product", "qualitative"],
  "design systems": ["design", "frontend", "component-based", "scalability"],

  // ── Data & AI ────────────────────────────────────────────
  ml: ["data", "ai", "programming", "mathematics"],
  dl: ["data", "ai", "neural-networks", "python"],
  nlp: ["data", "ai", "text", "linguistics"],
  "computer vision": ["data", "ai", "image", "deep-learning"],
  "data analysis": ["data", "analytics", "statistics", "business"],
  "data visualization": ["data", "visual", "analytics", "storytelling"],
  "data engineering": ["data", "backend", "pipeline", "infrastructure"],
  sql: ["database", "data", "analytics", "backend"],
  tableau: ["data", "visualization", "analytics", "business"],
  "power bi": ["data", "visualization", "analytics", "microsoft"],
  statistics: ["mathematics", "data", "research", "analytics"],
  "prompt engineering": ["ai", "llm", "productivity", "writing"],
  "rag systems": ["ai", "llm", "backend", "data"],

  // ── Business ─────────────────────────────────────────────
  entrepreneurship: ["business", "startup", "leadership", "strategy"],
  "product management": ["business", "product", "strategy", "leadership"],
  "project management": ["business", "organisation", "leadership", "planning"],
  scrum: ["business", "agile", "collaboration", "planning"],
  "digital marketing": ["marketing", "business", "growth", "online"],
  seo: ["marketing", "content", "growth", "technical"],
  "social media marketing": ["marketing", "content", "growth", "creative"],
  "growth hacking": ["marketing", "startup", "analytics", "growth"],
  sales: ["business", "communication", "negotiation", "revenue"],
  accounting: ["finance", "business", "numbers", "compliance"],
  leadership: ["management", "communication", "strategy", "people"],
  "e-commerce": ["business", "marketing", "online", "retail"],

  // ── Languages ────────────────────────────────────────────
  english: ["language", "communication", "international", "writing"],
  mandarin: ["language", "chinese", "international", "tonal"],
  spanish: ["language", "romance", "international", "latin-america"],
  arabic: ["language", "middle-east", "script", "semitic"],
  french: ["language", "romance", "international", "europe"],
  german: ["language", "europe", "germanic", "formal"],
  japanese: ["language", "asian", "script", "east-asia"],
  korean: ["language", "asian", "script", "east-asia"],
  portuguese: ["language", "romance", "international", "brazil"],
  hindi: ["language", "south-asia", "devanagari", "india"],
  "sign language": ["language", "accessibility", "visual", "communication"],
  nepali: ["language", "south-asia", "himalayan", "devanagari"],

  // ── Academic ─────────────────────────────────────────────
  mathematics: ["academic", "logical", "problem-solving", "foundation"],
  calculus: ["academic", "mathematics", "engineering", "physics"],
  physics: ["academic", "science", "mathematics", "engineering"],
  chemistry: ["academic", "science", "laboratory", "biology"],
  economics: ["academic", "social-science", "finance", "policy"],
  "essay writing": ["academic", "writing", "critical-thinking", "english"],
  "research methodology": ["academic", "research", "analytical", "scientific"],
  "ielts preparation": ["academic", "language", "test-prep", "english"],
  psychology: ["academic", "social-science", "behaviour", "mental-health"],

  // ── Creative Arts ────────────────────────────────────────
  drawing: ["art", "visual", "creative", "foundational"],
  watercolour: ["art", "painting", "traditional", "creative"],
  "digital art": ["art", "digital", "creative", "illustration"],
  photography: ["art", "visual", "creative", "technical"],
  "photo editing": ["art", "digital", "creative", "technical"],
  filmmaking: ["art", "video", "storytelling", "creative"],
  "video editing": ["art", "video", "digital", "technical"],
  "creative writing": ["art", "writing", "storytelling", "fiction"],
  "fashion design": ["art", "design", "creative", "wearable"],
  calligraphy: ["art", "writing", "visual", "traditional"],

  // ── Music ────────────────────────────────────────────────
  guitar: ["music", "instrument", "strings", "performance"],
  piano: ["music", "instrument", "keys", "classical", "performance"],
  violin: ["music", "instrument", "strings", "classical"],
  drumming: ["music", "instrument", "percussion", "rhythm"],
  singing: ["music", "voice", "performance", "vocal"],
  "vocal training": ["music", "voice", "technique", "performance"],
  "music theory": ["music", "academic", "composition", "foundational"],
  "music production": ["music", "digital", "audio", "creative"],
  djing: ["music", "performance", "events", "audio"],
  "mixing & mastering": ["music", "audio", "technical", "production"],

  // ── Trades ───────────────────────────────────────────────
  plumbing: ["trades", "home", "practical", "repair"],
  "electrical wiring": ["trades", "home", "technical", "safety"],
  carpentry: ["trades", "woodworking", "construction", "practical"],
  welding: ["trades", "metal", "construction", "fabrication"],
  tiling: ["trades", "home", "practical", "renovation"],
  "car mechanics": ["trades", "automotive", "practical", "repair"],
  "bicycle repair": ["trades", "transport", "practical", "maintenance"],
  "sewing & tailoring": ["trades", "textile", "fashion", "practical"],
  "3d printing": ["trades", "technology", "fabrication", "maker"],
  woodworking: ["trades", "making", "practical", "creative"],

  // ── Health & Fitness ─────────────────────────────────────
  "personal training": ["fitness", "health", "coaching", "physical"],
  weightlifting: ["fitness", "strength", "physical", "sport"],
  yoga: ["fitness", "mindfulness", "flexibility", "wellness"],
  pilates: ["fitness", "core", "physical", "wellness"],
  meditation: ["mindfulness", "wellness", "mental-health", "breathing"],
  "martial arts": ["fitness", "sport", "discipline", "self-defence"],
  "nutrition coaching": ["health", "food", "wellness", "coaching"],
  "first aid": ["health", "safety", "practical", "emergency"],
  "sports coaching": ["fitness", "coaching", "leadership", "sport"],

  // ── Cooking ──────────────────────────────────────────────
  "italian cooking": ["cooking", "cuisine", "european", "practical"],
  "asian cooking": ["cooking", "cuisine", "asian", "practical"],
  "baking & pastry": ["cooking", "baking", "sweet", "practical"],
  "vegan cooking": ["cooking", "plant-based", "healthy", "lifestyle"],
  "barista skills": ["cooking", "coffee", "hospitality", "beverage"],
  "cocktail making": ["cooking", "beverage", "hospitality", "creative"],

  // ── Lifestyle ────────────────────────────────────────────
  "interior design": ["home", "aesthetic", "creative", "practical"],
  "home organisation": ["lifestyle", "productivity", "practical", "minimalism"],
  gardening: ["lifestyle", "outdoor", "nature", "practical"],
  "travel planning": [
    "lifestyle",
    "organisation",
    "international",
    "adventure",
  ],
  chess: ["lifestyle", "strategy", "logical", "competitive"],
  "knitting & crocheting": ["lifestyle", "craft", "traditional", "creative"],

  // ── Communication ────────────────────────────────────────
  "public speaking": [
    "communication",
    "confidence",
    "performance",
    "leadership",
  ],
  "presentation skills": ["communication", "business", "visual", "persuasion"],
  storytelling: ["communication", "creative", "marketing", "writing"],
  negotiation: ["communication", "business", "persuasion", "sales"],
  coaching: ["communication", "leadership", "mentoring", "people"],
  copywriting: ["communication", "marketing", "writing", "persuasion"],
  "technical writing": ["communication", "writing", "documentation", "tech"],

  // ── Finance ──────────────────────────────────────────────
  "personal budgeting": ["finance", "lifestyle", "practical", "planning"],
  "investing basics": ["finance", "wealth", "planning", "economics"],
  "stock market": ["finance", "investing", "trading", "economics"],
  "crypto basics": ["finance", "blockchain", "investing", "digital"],
  "real estate investing": ["finance", "property", "investing", "long-term"],
  "tax planning": ["finance", "compliance", "business", "practical"],

  // ── Content Creation ─────────────────────────────────────
  "youtube content": ["content", "video", "growth", "social-media"],
  "podcast production": ["content", "audio", "storytelling", "media"],
  "tiktok content": ["content", "video", "short-form", "social-media"],
  "blog writing": ["content", "writing", "seo", "long-form"],
  "newsletter writing": ["content", "writing", "email", "community"],
  "thumbnail design": ["content", "design", "visual", "youtube"],
};

// ─────────────────────────────────────────────────────────────
// 6. LOCAL RULE-BASED CATEGORISER  (no network, instant)
// ─────────────────────────────────────────────────────────────
export const categorizeLocal = (normalizedName) => {
  const resolved = resolveAlias(normalizedName);
  return skillToCategoryMap[resolved] ?? null;
};

// ─────────────────────────────────────────────────────────────
// 7. AI CLASSIFICATION  (HuggingFace BART — free tier)
// ─────────────────────────────────────────────────────────────
export const classifySkillAI = async (skillName) => {
  try {
    const res = await fetch(
      "https://api-inference.huggingface.co/models/facebook/bart-large-mnli",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: `skill: ${skillName}`,
          parameters: {
            candidate_labels: Object.keys(SKILL_TAXONOMY),
          },
        }),
      },
    );

    const data = await res.json();
    if (!data?.labels?.length) return { category: "Other", confidence: 0 };

    return {
      category: data.labels[0],
      confidence: parseFloat(data.scores[0].toFixed(3)),
    };
  } catch {
    return { category: "Other", confidence: 0 };
  }
};

// ─────────────────────────────────────────────────────────────
// 8. HYBRID CATEGORISER  (local-first → AI fallback)
// ─────────────────────────────────────────────────────────────
export const categorizeSkill = async (normalizedName) => {
  if (!normalizedName) return "Other";

  const local = categorizeLocal(normalizedName);
  if (local) return local; // instant, no API call

  const { category } = await classifySkillAI(normalizedName);
  return category;
};

// ─────────────────────────────────────────────────────────────
// 9. TAG GENERATOR  (for matching engine)
//    Returns tags for a skill + auto-inherits the category tag
// ─────────────────────────────────────────────────────────────
export const generateSkillTags = (normalizedName, category) => {
  const resolved = resolveAlias(normalizedName);
  const explicit = SKILL_TAGS[resolved] ?? [];
  const catTag = category ? [category.toLowerCase().replace(/\s+/g, "-")] : [];
  return [...new Set([...explicit, ...catTag])];
};

// ─────────────────────────────────────────────────────────────
// 10. SEARCH HELPER  (autocomplete / fuzzy prefix)
//     Returns matching skill names ranked by prefix then includes
// ─────────────────────────────────────────────────────────────
export const searchTaxonomy = (query, limit = 10) => {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  const allSkills = Object.values(SKILL_TAXONOMY).flat();

  const prefixMatches = allSkills.filter((s) => s.startsWith(q));
  const includeMatches = allSkills.filter(
    (s) => !s.startsWith(q) && s.includes(q),
  );

  return [...new Set([...prefixMatches, ...includeMatches])].slice(0, limit);
};

// ─────────────────────────────────────────────────────────────
// 11. EMBEDDING PLACEHOLDER  (ML-ready)
// ─────────────────────────────────────────────────────────────
export const generateSkillEmbedding = async (normalizedName) => {
  const hash = normalizedName
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);

  return Array.from({ length: 10 }, (_, i) => Math.sin(hash * (i + 1)) * 0.1);
};

// ─────────────────────────────────────────────────────────────
// 12. VALIDATION
// ─────────────────────────────────────────────────────────────
export const validateSkillInput = (name, level) => {
  if (!name || typeof name !== "string") {
    throw new Error("Skill name is required and must be a string");
  }
  if (name.trim().length < 2) {
    throw new Error("Skill name must be at least 2 characters");
  }
  if (name.trim().length > 80) {
    throw new Error("Skill name must be under 80 characters");
  }
  if (level !== undefined) {
    if (typeof level !== "number" || level < 1 || level > 5) {
      throw new Error("Skill level must be between 1 and 5");
    }
  }
};
