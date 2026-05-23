import crypto from "crypto";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function signAccessToken(user, companyId) {
  return jwt.sign(
    {
      sub: user._id.toString(),
      companyId: companyId?.toString(),
      type: "access"
    },
    env.jwtAccessSecret,
    { expiresIn: env.jwtAccessExpiresIn }
  );
}

export function signRefreshToken(user, tokenId) {
  return jwt.sign(
    {
      sub: user._id.toString(),
      jti: tokenId,
      type: "refresh"
    },
    env.jwtRefreshSecret,
    { expiresIn: env.jwtRefreshExpiresIn }
  );
}

export function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function randomToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString("hex");
}
