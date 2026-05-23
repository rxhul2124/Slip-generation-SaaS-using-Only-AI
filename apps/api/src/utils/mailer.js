import nodemailer from "nodemailer";
import { env } from "../config/env.js";

const hasSmtp = Boolean(env.smtp.host && env.smtp.user && env.smtp.pass);

const transporter = hasSmtp
  ? nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.port === 465,
      auth: { user: env.smtp.user, pass: env.smtp.pass }
    })
  : null;

export async function sendMail({ to, subject, html, text }) {
  if (!transporter) {
    console.info(`[mail:dev] ${subject} -> ${to}\n${text || html}`);
    return { accepted: [to], dev: true };
  }

  return transporter.sendMail({
    from: env.smtp.from,
    to,
    subject,
    html,
    text
  });
}
