import mongoose from "mongoose";

const skillItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    level: { type: Number, required: true, min: 1, max: 5 }, // 1=Beginner, 5=Expert
    category: { type: String, required: true, trim: true },
    normalizedName: { type: String, required: true, index: true },
    tags: { type: [String], default: [] }, // Auto-generated tags for matching
    embedding: { type: [Number], default: [] }, // For future AI/ML vector search
  },
  { _id: true }
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
  { timestamps: true }
);

// Indexes for recommendation queries
skillProfileSchema.index({ "offerSkills.normalizedName": 1 });
skillProfileSchema.index({ "wantSkills.normalizedName": 1 });
skillProfileSchema.index({ "offerSkills.tags": 1 });
skillProfileSchema.index({ "wantSkills.tags": 1 });

export default mongoose.model("SkillProfile", skillProfileSchema);
