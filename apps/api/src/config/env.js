import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../../../.env") });

const number = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const cleanStr = (val, fallback = "") => {
  if (!val) return fallback;
  return String(val).replace(/[\r\n\t]/g, "").trim();
};

const required = (name, fallback) => {
  const value = cleanStr(process.env[name]);
  if (value) return value;
  if (fallback !== undefined) return fallback;
  throw new Error(`${name} must be set in the environment`);
};

const strongSecret = (name, fallback) => {
  const value = cleanStr(process.env[name]);
  if (value && value.length >= 32) return value;
  if (fallback) return fallback;
  if (process.env.NODE_ENV === "production") {
    throw new Error(`${name} must be at least 32 characters long in production`);
  }
  return crypto.randomBytes(32).toString("hex");
};

export const env = {
  nodeEnv: cleanStr(process.env.NODE_ENV, "development"),
  port: number(process.env.PORT, 5000),
  mongoUri: required("MONGODB_URI", process.env.DATABASE_URL || "mongodb://localhost:27017/slipora"),
  clientUrl: cleanStr(process.env.CLIENT_URL, "http://localhost:5173"),
  apiUrl: cleanStr(process.env.API_URL, "http://localhost:5000/api/v1"),
  jwtAccessSecret: strongSecret("JWT_ACCESS_SECRET"),
  jwtRefreshSecret: strongSecret("JWT_REFRESH_SECRET"),
  jwtAccessExpiresIn: cleanStr(process.env.JWT_ACCESS_EXPIRES_IN, "15m"),
  jwtRefreshExpiresIn: cleanStr(process.env.JWT_REFRESH_EXPIRES_IN, "30d"),
  cookieSecret: strongSecret("COOKIE_SECRET"),
  csrfSecret: strongSecret("CSRF_SECRET"),
  bcryptRounds: number(process.env.BCRYPT_ROUNDS, 12),
  smtp: {
    host: cleanStr(process.env.SMTP_HOST),
    port: number(process.env.SMTP_PORT, 587),
    user: cleanStr(process.env.SMTP_USER),
    pass: cleanStr(process.env.SMTP_PASS),
    from: cleanStr(process.env.MAIL_FROM, "Slipora <no-reply@slipora.local>")
  },
  cloudinary: {
    cloudName: cleanStr(process.env.CLOUDINARY_CLOUD_NAME),
    apiKey: cleanStr(process.env.CLOUDINARY_API_KEY),
    apiSecret: cleanStr(process.env.CLOUDINARY_API_SECRET)
  },
  aws: {
    region: cleanStr(process.env.AWS_REGION),
    accessKeyId: cleanStr(process.env.AWS_ACCESS_KEY_ID),
    secretAccessKey: cleanStr(process.env.AWS_SECRET_ACCESS_KEY),
    bucket: cleanStr(process.env.S3_BUCKET)
  },
  stripeSecretKey: cleanStr(process.env.STRIPE_SECRET_KEY),
  stripeWebhookSecret: cleanStr(process.env.STRIPE_WEBHOOK_SECRET),
  razorpayKeyId: cleanStr(process.env.RAZORPAY_KEY_ID),
  razorpayKeySecret: cleanStr(process.env.RAZORPAY_KEY_SECRET),
  razorpayWebhookSecret: cleanStr(process.env.RAZORPAY_WEBHOOK_SECRET),
  isProduction: cleanStr(process.env.NODE_ENV) === "production"
};
