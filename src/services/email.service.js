import { createTransporter } from "../config/mail.js";
import { env } from "../config/env.js";

/**
 * Send a transactional email.
 *
 * @param {string} to - Recipient email address
 * @param {{ subject: string, html: string, text?: string }} template - Email template object
 */
export const sendEmail = async (to, template) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"${env.EMAIL_FROM_NAME}" <${env.EMAIL_FROM_ADDRESS}>`,
    to,
    subject: template.subject,
    html: template.html,
    ...(template.text && { text: template.text }),
  };

  const info = await transporter.sendMail(mailOptions);

  if (env.NODE_ENV === "development") {
    console.log(`Email sent to ${to} — MessageId: ${info.messageId}`);
  }

  return info;
};
