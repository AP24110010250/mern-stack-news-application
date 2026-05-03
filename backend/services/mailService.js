import nodemailer from "nodemailer";

export const sendPasswordResetEmail = async ({ to, resetUrl }) => {
  const transporter = createTransporter();

  if (!transporter) {
    console.warn(`Password reset link for ${to}: ${resetUrl}`);
    return { delivered: false, resetUrl };
  }

  await transporter.sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to,
    subject: "Reset your PulseWire password",
    text: `Use this link to reset your password: ${resetUrl}\n\nThis link expires in 1 hour.`,
    html: `
      <p>Use this link to reset your PulseWire password:</p>
      <p><a href="${resetUrl}">Reset password</a></p>
      <p>This link expires in 1 hour.</p>
    `
  });

  return { delivered: true };
};

const createTransporter = () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    }
  });
};
