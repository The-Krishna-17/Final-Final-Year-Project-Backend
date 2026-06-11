import mongoose from "mongoose";

const skillItemSchema = new mongoose.Schema(
  {
    rawInput: { type: String, default: "", trim: true },
    domain: { type: String, default: "General" },
    primarySkill: {
      name: { type: String, default: "" },
      category: { type: String, default: "Other" },
    },
    topics: { type: [String], default: [] },
    technologies: { type: [String], default: [] },
    difficulty: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
    },
    tokens: { type: [String], default: [] },
    processedAt: { type: Date, default: Date.now },
  },
  { _id: true },
);

const skillProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    offerSkills: [skillItemSchema],
    wantSkills: [skillItemSchema],
    availability: {
      type: String,
      enum: ["available", "busy", "not_looking"],
      default: "available",
    },
    location: {
      city: { type: String, trim: true },
      country: { type: String, trim: true },
    },
    mode: {
      type: String,
      enum: ["online", "offline", "both"],
      default: "both",
    },
    reputationScore: {
      type: Number,
      default: 0,
      index: true,
    },
  },
  { timestamps: true },
);

// Indexes for recommendation queries
skillProfileSchema.index({ "offerSkills.primarySkill.name": 1 });
skillProfileSchema.index({ "wantSkills.primarySkill.name": 1 });
skillProfileSchema.index({ "offerSkills.tokens": 1 });
skillProfileSchema.index({ "wantSkills.tokens": 1 });

export default mongoose.model("SkillProfile", skillProfileSchema);
