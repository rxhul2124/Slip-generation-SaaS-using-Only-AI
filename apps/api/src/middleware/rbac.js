import { AppError } from "../utils/AppError.js";

const rank = {
  staff: 1,
  manager: 2,
  admin: 3,
  owner: 4
};

export function requireRole(...roles) {
  return (req, _res, next) => {
    if (!roles.includes(req.role)) {
      return next(new AppError("You do not have permission for this action", 403));
    }
    return next();
  };
}

export function requireAtLeast(role) {
  return (req, _res, next) => {
    if ((rank[req.role] || 0) < rank[role]) {
      return next(new AppError("You do not have permission for this action", 403));
    }
    return next();
  };
}
