import mongoose from "mongoose";

const passwordResetTokenSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tokenHash: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    },
    usedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-delete via TTL
passwordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
passwordResetTokenSchema.index({ user: 1 });

const PasswordResetToken = mongoose.model("PasswordResetToken", passwordResetTokenSchema);

export default PasswordResetToken;
