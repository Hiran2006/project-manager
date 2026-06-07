import nodemailer from "nodemailer"
import ENV from "@src/ENV.js"
import type Mail from "nodemailer/lib/mailer/index.js"
const transporter = nodemailer.createTransport({
  host: ENV.SMTP_HOST,
  port: ENV.SMTP_PORT,
  auth: {
    user: ENV.SMTP_USER,
    pass: ENV.SMTP_PASS,
  },
} as Mail.Options)

async function sentResetEmail(email: string, resetLink: string) {
  await transporter.sendMail({
    from: '"Jira Clone" <noreply@jiraclone.com>',
    to: email,
    subject: "Reset Your Password",
    html: `
      <h2>Password Reset</h2>
      <p>Click the link below to reset your password.</p>
      <a href="${resetLink}">
        Reset Password
      </a>
    `,
  })
}

export { sentResetEmail }
