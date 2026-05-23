import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

function tokenFrom(req) {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) return header.slice(7);
  return req.cookies?.accessToken;
}

export const requireAuth = asyncHandler(async (req, _res, next) => {
  const token = tokenFrom(req);
  if (!token) throw new AppError("Authentication required", 401);

  const payload = jwt.verify(token, env.jwtAccessSecret);
  if (payload.type !== "access") throw new AppError("Invalid access token", 401);

  const user = await User.findById(payload.sub);
  if (!user) throw new AppError("User not found", 401);

  const requestedCompany = req.headers["x-company-id"] || payload.companyId || user.currentCompany;
  const role = user.roleFor(requestedCompany);
  if (!role) throw new AppError("No active membership for this workspace", 403);

  req.user = user;
  req.companyId = requestedCompany.toString();
  req.role = role;
  next();
});
