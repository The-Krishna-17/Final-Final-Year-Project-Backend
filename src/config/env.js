import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.string().default("5000"),

  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),

  JWT_ACCESS_SECRET: z
    .string()
    .min(32, "JWT_ACCESS_SECRET must be at least 32 characters"),
  JWT_REFRESH_SECRET: z
    .string()
    .min(32, "JWT_REFRESH_SECRET must be at least 32 characters"),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),

  CLIENT_URL: z.string().url().default("*"),

  SMTP_HOST: z.string().min(1, "SMTP_HOST is required"),
  SMTP_PORT: z.string().default("587"),
  SMTP_SECURE: z.string().default("false"),
  SMTP_USER: z.string().min(1, "SMTP_USER is required"),
  SMTP_PASS: z.string().min(1, "SMTP_PASS is required"),
  EMAIL_FROM_NAME: z.string().default("Auth App"),
  EMAIL_FROM_ADDRESS: z.string().email().default("noreply@authapp.com"),

  BCRYPT_SALT_ROUNDS: z.string().default("12"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:\n");
  parsed.error.issues.forEach((issue) => {
    console.error(`  → ${issue.path.join(".")}: ${issue.message}`);
  });
  process.exit(1);
}

export const env = {
  ...parsed.data,
  PORT: parseInt(parsed.data.PORT, 10),
  SMTP_PORT: parseInt(parsed.data.SMTP_PORT, 10),
  SMTP_SECURE: parsed.data.SMTP_SECURE === "true",
  BCRYPT_SALT_ROUNDS: parseInt(parsed.data.BCRYPT_SALT_ROUNDS, 10),
  IS_PRODUCTION: parsed.data.NODE_ENV === "production",
};
