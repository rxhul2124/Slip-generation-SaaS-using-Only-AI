import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../../../.env") });

const number = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const required = (name) => {
  const value = process.env[name];
  if (!value) throw new Error(`${name} must be set in the environment`);
  return value;
};

const strongSecret = (name) => {
  const value = required(name);
  if (value.length < 32) throw new Error(`${name} must be at least 32 characters long`);
  return value;
};

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: number(process.env.PORT, 5000),
  mongoUri: required("MONGODB_URI"),
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  apiUrl: process.env.API_URL || "http://localhost:5000/api/v1",
  jwtAccessSecret: strongSecret("JWT_ACCESS_SECRET"),
  jwtRefreshSecret: strongSecret("JWT_REFRESH_SECRET"),
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  cookieSecret: strongSecret("COOKIE_SECRET"),
  csrfSecret: strongSecret("CSRF_SECRET"),
  bcryptRounds: number(process.env.BCRYPT_ROUNDS, 12),
  smtp: {
    host: process.env.SMTP_HOST,
    port: number(process.env.SMTP_PORT, 587),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.MAIL_FROM || "Slipora <no-reply@slipora.local>"
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET
  },
  aws: {
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    bucket: process.env.S3_BUCKET
  },
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  razorpayKeyId: process.env.RAZORPAY_KEY_ID,
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET,
  isProduction: process.env.NODE_ENV === "production"
};
