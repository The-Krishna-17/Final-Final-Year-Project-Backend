import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userAgent: {
      type: String,
      default: null,
    },
    ipAddress: {
      type: String,
      default: null,
    },
    isRevoked: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-delete expired tokens via MongoDB TTL index
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
refreshTokenSchema.index({ user: 1 });
refreshTokenSchema.index({ token: 1 });

const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema);

export default RefreshToken;
