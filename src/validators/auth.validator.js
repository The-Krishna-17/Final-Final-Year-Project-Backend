import { z } from "zod";

// ─── Reusable field schemas ───────────────────────────────────────────────────

const nameSchema = (label) =>
  z
    .string({ required_error: `${label} is required` })
    .trim()
    .min(2, `${label} must be at least 2 characters`)
    .max(50, `${label} must not exceed 50 characters`)
    .regex(/^[a-zA-Z\s'-]+$/, `${label} can only contain letters, spaces, hyphens, and apostrophes`);

const emailSchema = z
  .string({ required_error: "Email is required" })
  .trim()
  .toLowerCase()
  .email("Please provide a valid email address");

const passwordSchema = z
  .string({ required_error: "Password is required" })
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must not exceed 128 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

// ─── Schemas ──────────────────────────────────────────────────────────────────

export const registerSchema = z.object({
  firstName: nameSchema("First name"),
  lastName: nameSchema("Last name"),
  email: emailSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string({ required_error: "Password is required" }).min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string({ required_error: "Confirm password is required" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const refreshTokenSchema = z.object({
  refreshToken: z.string().optional(), // Can also come from cookie
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string({ required_error: "Current password is required" }).min(1),
    newPassword: passwordSchema,
    confirmPassword: z.string({ required_error: "Confirm password is required" }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  });
