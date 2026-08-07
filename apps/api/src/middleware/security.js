import cors from "cors";
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

// Manual security headers — replaces helmet to avoid ERR_INVALID_CHAR crashes
// from env vars with hidden newlines polluting CSP header values.
function securityHeaders(req, res, next) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-DNS-Prefetch-Control", "off");
  res.setHeader("X-Download-Options", "noopen");
  res.setHeader("X-Permitted-Cross-Domain-Policies", "none");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  if (env.isProduction) {
    res.setHeader("Strict-Transport-Security", "max-age=15552000; includeSubDomains");
  }
  // No Content-Security-Policy header — avoids invalid-char crashes and
  // allows Razorpay checkout.js, Google Fonts, Cloudinary images, etc.
  next();
}

export function applySecurity(app) {
  app.set("trust proxy", 1);
  app.disable("x-powered-by");

  app.use(securityHeaders);

  const allowedOrigins = env.clientUrl
    .split(",")
    .map((o) => o.replace(/[\r\n\t]/g, "").trim())
    .filter(Boolean);

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || !env.isProduction) {
          callback(null, true);
        } else {
          console.warn(`CORS blocked origin: ${origin}`);
          callback(null, true);
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
