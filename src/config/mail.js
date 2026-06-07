import nodemailer from "nodemailer";
import { env } from "./env.js";

export const createTransporter = () => {
  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });
};

export const verifyMailConnection = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log("Mail server connection established.");
  } catch (error) {
    console.warn(`Mail server connection failed: ${error.message}`);
  }
};
