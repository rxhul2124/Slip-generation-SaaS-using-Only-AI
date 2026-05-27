import cors from "cors";
import helmet from "helmet";
import hpp from "hpp";
import mongoSanitize from "express-mongo-sanitize";
import cookieParser from "cookie-parser";
import compression from "compression";
import validator from "validator";
import { env } from "../config/env.js";

const sensitiveKeys = new Set(["password", "token", "refreshToken", "accessToken", "csrfToken", "signatureImage", "padSignature", "imageDataUrl"]);

function sanitizeValue(value, key) {
  if (typeof value === "string") {
    const trimmed = validator.trim(value.replace(/\0/g, ""));
    return sensitiveKeys.has(key) ? trimmed : validator.escape(trimmed);
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
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'", env.clientUrl],
          frameAncestors: ["'none'"]
        }
      },
      crossOriginResourcePolicy: { policy: "cross-origin" },
      hsts: { maxAge: 15552000, includeSubDomains: true },
      frameguard: { action: "deny" },
      noSniff: true,
      referrerPolicy: { policy: "strict-origin-when-cross-origin" }
    })
  );
  app.use(
    cors({
      origin: env.clientUrl.split(",").map((origin) => origin.trim()).filter(Boolean),
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
    })
  );
  app.use(cookieParser(env.cookieSecret));
  app.use(mongoSanitize());
  app.use(hpp());
  app.use(compression());
}
