import { env } from "../config/env.js";

const baseStyles = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, sans-serif;
  background-color: #f4f7f9;
  margin: 0;
  padding: 0;
`;

const cardStyles = `
  max-width: 600px;
  margin: 40px auto;
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
`;

const headerStyles = `
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 32px;
  text-align: center;
`;

const bodyStyles = `
  padding: 40px 32px;
  color: #374151;
`;

const buttonStyles = `
  display: inline-block;
  padding: 14px 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff !important;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 16px;
  letter-spacing: 0.3px;
  margin: 24px 0;
`;

const footerStyles = `
  padding: 24px 32px;
  text-align: center;
  color: #9ca3af;
  font-size: 13px;
  border-top: 1px solid #f3f4f6;
`;

const wrapTemplate = (content, title) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="${baseStyles}">
  <div style="${cardStyles}">
    <div style="${headerStyles}">
      <h1 style="color:#ffffff; margin:0; font-size:24px; font-weight:700; letter-spacing:-0.5px;">
        ${env.EMAIL_FROM_NAME}
      </h1>
    </div>
    ${content}
    <div style="${footerStyles}">
      <p style="margin:0">© ${new Date().getFullYear()} ${env.EMAIL_FROM_NAME}. All rights reserved.</p>
      <p style="margin:6px 0 0">This is an automated email — please do not reply.</p>
    </div>
  </div>
</body>
</html>
`;

// ─── Welcome Email ────────────────────────────────────────────────────────────

export const welcomeEmailTemplate = (user) => ({
  subject: `Welcome to ${env.EMAIL_FROM_NAME}, ${user.firstName}!`,
  html: wrapTemplate(
    `<div style="${bodyStyles}">
      <h2 style="margin:0 0 16px; font-size:22px; color:#111827;">
        Welcome aboard, ${user.firstName}! 🎉
      </h2>
      <p style="margin:0 0 12px; line-height:1.7; color:#6b7280;">
        We're excited to have you join us. Your account has been successfully created.
      </p>
      <table style="width:100%; border-collapse:collapse; margin:24px 0; border-radius:8px; overflow:hidden; border:1px solid #e5e7eb;">
        <tr style="background:#f9fafb;">
          <td style="padding:12px 16px; font-weight:600; color:#374151; width:40%;">Full Name</td>
          <td style="padding:12px 16px; color:#6b7280;">${user.firstName} ${user.lastName}</td>
        </tr>
        <tr>
          <td style="padding:12px 16px; font-weight:600; color:#374151;">Email</td>
          <td style="padding:12px 16px; color:#6b7280;">${user.email}</td>
        </tr>
      </table>
      <p style="margin:0; line-height:1.7; color:#6b7280;">
        If you have any questions, feel free to reach out to our support team.
      </p>
    </div>`,
    `Welcome to ${env.EMAIL_FROM_NAME}`
  ),
});

// ─── Email Verification ───────────────────────────────────────────────────────

export const emailVerificationTemplate = (user, verificationUrl) => ({
  subject: "Verify your email address",
  html: wrapTemplate(
    `<div style="${bodyStyles}">
      <h2 style="margin:0 0 16px; font-size:22px; color:#111827;">
        Verify Your Email
      </h2>
      <p style="margin:0 0 12px; line-height:1.7; color:#6b7280;">
        Hi ${user.firstName}, please click the button below to verify your email address.
        This link will expire in <strong>24 hours</strong>.
      </p>
      <div style="text-align:center;">
        <a href="${verificationUrl}" style="${buttonStyles}">Verify Email Address</a>
      </div>
      <p style="margin:0; line-height:1.7; color:#6b7280; font-size:14px;">
        Or copy and paste this URL into your browser:<br/>
        <span style="color:#667eea; word-break:break-all;">${verificationUrl}</span>
      </p>
      <p style="margin:16px 0 0; font-size:13px; color:#9ca3af;">
        If you did not create an account, please ignore this email.
      </p>
    </div>`,
    "Verify Your Email"
  ),
});

// ─── Password Reset ───────────────────────────────────────────────────────────

export const passwordResetTemplate = (user, resetUrl) => ({
  subject: "Reset your password",
  html: wrapTemplate(
    `<div style="${bodyStyles}">
      <h2 style="margin:0 0 16px; font-size:22px; color:#111827;">
        Password Reset Request
      </h2>
      <p style="margin:0 0 12px; line-height:1.7; color:#6b7280;">
        Hi ${user.firstName}, we received a request to reset your password.
        Click the button below to proceed. This link expires in <strong>1 hour</strong>.
      </p>
      <div style="text-align:center;">
        <a href="${resetUrl}" style="${buttonStyles}">Reset Password</a>
      </div>
      <p style="margin:0; line-height:1.7; color:#6b7280; font-size:14px;">
        Or copy and paste this URL into your browser:<br/>
        <span style="color:#667eea; word-break:break-all;">${resetUrl}</span>
      </p>
      <div style="margin:24px 0 0; padding:16px; background:#fef3c7; border-radius:8px; border-left:4px solid #f59e0b;">
        <p style="margin:0; font-size:14px; color:#92400e;">
          ⚠️ If you did not request a password reset, please ignore this email and your password will remain unchanged.
        </p>
      </div>
    </div>`,
    "Reset Your Password"
  ),
});

// ─── Password Changed ─────────────────────────────────────────────────────────

export const passwordChangedTemplate = (user) => ({
  subject: "Your password has been changed",
  html: wrapTemplate(
    `<div style="${bodyStyles}">
      <h2 style="margin:0 0 16px; font-size:22px; color:#111827;">
        Password Changed Successfully
      </h2>
      <p style="margin:0 0 12px; line-height:1.7; color:#6b7280;">
        Hi ${user.firstName}, your password has been successfully changed.
      </p>
      <div style="margin:24px 0; padding:16px; background:#fee2e2; border-radius:8px; border-left:4px solid #ef4444;">
        <p style="margin:0; font-size:14px; color:#991b1b;">
          🔐 If you did not make this change, please contact our support team immediately or reset your password.
        </p>
      </div>
      <p style="margin:0; line-height:1.7; color:#6b7280; font-size:14px;">
        Changed at: <strong>${new Date().toUTCString()}</strong>
      </p>
    </div>`,
    "Password Changed"
  ),
});
