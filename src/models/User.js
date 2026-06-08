import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { env } from "../config/env.js";

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      minlength: [2, "First name must be at least 2 characters"],
      maxlength: [50, "First name must not exceed 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      minlength: [2, "Last name must be at least 2 characters"],
      maxlength: [50, "Last name must not exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // Never returned in queries by default
    },
    role: {
      type: String,
      enum: ["user", "admin", "moderator"],
      default: "user",
    },
    avatar: {
      type: String,
      default: null,
    },

    // ─── Extended Profile Fields ─────────────────────────────────────────────

    bio: {
      type: String,
      trim: true,
      maxlength: [500, "Bio must not exceed 500 characters"],
      default: null,
    },

    // currentWork — same shape as a workExperience entry; endDate null = still here
    currentWork: {
      company: { type: String, trim: true, maxlength: [100, "Company must not exceed 100 characters"], default: null },
      role:    { type: String, trim: true, maxlength: [100, "Role must not exceed 100 characters"],    default: null },
      startDate: {
        year:  { type: Number, min: 1950, default: null },
        month: { type: Number, min: 1, max: 12, default: null },
        day:   { type: Number, min: 1, max: 31, default: null },
      },
      endDate: {
        year:  { type: Number, min: 1950, default: null },
        month: { type: Number, min: 1, max: 12, default: null },
        day:   { type: Number, min: 1, max: 31, default: null },
      },
      description: { type: String, trim: true, maxlength: [500, "Description must not exceed 500 characters"], default: null },
    },

    workExperience: [
      {
        company: {
          type: String,
          trim: true,
          required: true,
          maxlength: [100, "Company name must not exceed 100 characters"],
        },
        role: {
          type: String,
          trim: true,
          required: true,
          maxlength: [100, "Role must not exceed 100 characters"],
        },
        startDate: {
          year:  { type: Number, required: true, min: [1950, "Start year seems invalid"] },
          month: { type: Number, required: true, min: 1, max: 12 },
          day:   { type: Number, default: null, min: 1, max: 31 },
        },
        endDate: {
          // null top-level object = "Present / Ongoing"
          year:  { type: Number, min: [1950, "End year seems invalid"] },
          month: { type: Number, min: 1, max: 12 },
          day:   { type: Number, default: null, min: 1, max: 31 },
        },
        description: {
          type: String,
          trim: true,
          maxlength: [500, "Description must not exceed 500 characters"],
          default: null,
        },
      },
    ],

    socialLinks: {
      linkedin: { type: String, trim: true, default: null },
      github: { type: String, trim: true, default: null },
      twitter: { type: String, trim: true, default: null },
      instagram: { type: String, trim: true, default: null },
      website: { type: String, trim: true, default: null },
      facebook: { type: String, trim: true, default: null },
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
      select: false,
    },
    emailVerificationExpires: {
      type: Date,
      select: false,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_, ret) {
        delete ret.password;
        delete ret.__v;
        delete ret.loginAttempts;
        delete ret.lockUntil;
        delete ret.emailVerificationToken;
        delete ret.emailVerificationExpires;
        return ret;
      },
    },
  },
);

// ─── Virtuals ────────────────────────────────────────────────────────────────

userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

userSchema.virtual("isLocked").get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// ─── Pre-save Hook ────────────────────────────────────────────────────────────

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, env.BCRYPT_SALT_ROUNDS);
  next();
});

// ─── Instance Methods ─────────────────────────────────────────────────────────

/**
 * Compare a plain text password against the hashed password.
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * Increment login attempts and lock the account if threshold is reached.
 */
userSchema.methods.incrementLoginAttempts = async function () {
  // Reset attempts if the previous lock has expired
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 },
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };

  if (this.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS && !this.isLocked) {
    updates.$set = { lockUntil: new Date(Date.now() + LOCK_DURATION_MS) };
  }

  return this.updateOne(updates);
};

/**
 * Reset login attempts after a successful login.
 */
userSchema.methods.resetLoginAttempts = async function () {
  return this.updateOne({
    $set: { loginAttempts: 0, lastLogin: new Date() },
    $unset: { lockUntil: 1 },
  });
};

// ─── Indexes ──────────────────────────────────────────────────────────────────

userSchema.index({ email: 1 });
userSchema.index({ createdAt: -1 });

const User = mongoose.model("User", userSchema);

export default User;
