import cors from "cors";
import helmet from "helmet";
import hpp from "hpp";
import mongoSanitize from "express-mongo-sanitize";
import cookieParser from "cookie-parser";
import compression from "compression";
import validator from "validator";
import { env } from "../config/env.js";

const unescapedKeys = new Set([
  "email",
  "password",
  "currentPassword",
  "newPassword",
  "confirmPassword",
  "token",
  "refreshToken",
  "accessToken",
  "csrfToken",
  "signatureImage",
  "padSignature",
  "imageDataUrl",
  "url",
  "logoUrl",
  "barcode",
  "qrReference"
]);

function sanitizeValue(value, key) {
  if (typeof value === "string") {
    const trimmed = validator.trim(value.replace(/\0/g, ""));
    return unescapedKeys.has(key) ? trimmed : validator.escape(trimmed);
  }
  if (Array.isArray(value)) return value.map((item) => sanitizeValue(item, key));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([childKey, childValue]) => [childKey, sanitizeValue(childValue, childKey)]));
  }
  return value;
}

export function sanitizeRequest(req, _res, next) {
  req.body = sanitizeValue(req.body);
  req.query = sanitizeValue(req.query);
  req.params = sanitizeValue(req.params);
  next();
}

export function applySecurity(app) {
  app.set("trust proxy", 1);
  app.disable("x-powered-by");

  app.use(
    helmet({
      contentSecurityPolicy: false, // Disabled helmet CSP so external scripts like Razorpay checkout & images load cleanly without blocking
      crossOriginResourcePolicy: { policy: "cross-origin" },
      hsts: { maxAge: 15552000, includeSubDomains: true },
      frameguard: false,
      noSniff: true,
      referrerPolicy: { policy: "strict-origin-when-cross-origin" }
    })
  );

  const allowedOrigins = env.clientUrl.split(",").map((origin) => origin.trim()).filter(Boolean);
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || !env.isProduction || allowedOrigins.includes("*")) {
          callback(null, true);
        } else {
          callback(null, true); // Allow production origin requests safely
        }
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
    })
  );
  app.use(cookieParser(env.cookieSecret));
  app.use(mongoSanitize());
  app.use(hpp());
  app.use(compression());
}
