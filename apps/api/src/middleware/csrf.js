import { randomToken } from "../utils/tokens.js";
import { AppError } from "../utils/AppError.js";
import { env } from "../config/env.js";

const stateChanging = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export function csrfToken(req, res) {
  const token = req.cookies?.csrfToken || randomToken(24);
  res.cookie("csrfToken", token, {
    httpOnly: false,
    secure: env.isProduction,
    sameSite: env.isProduction ? "none" : "lax"
  });
  res.json({ status: "success", data: { csrfToken: token } });
}

export function csrfProtection(req, _res, next) {
  if (!stateChanging.has(req.method)) return next();
  if (req.headers.authorization?.startsWith("Bearer ")) return next();
  if (req.path.startsWith("/api/v1/auth/")) return next();
  if (!req.cookies?.accessToken && !req.cookies?.refreshToken) return next();

  const cookieToken = req.cookies?.csrfToken;
  const headerToken = req.headers["x-csrf-token"];
  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return next(new AppError("CSRF token mismatch", 403));
  }
  return next();
}
