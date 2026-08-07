import { hasFeature, isWithinLimit } from "../config/plans.config.js";
import { Company } from "../models/Company.js";
import { usageCounterService } from "../services/usageCounter.service.js";
import { AppError } from "../utils/AppError.js";

export function requireFeature(feature) {
  return async (req, _res, next) => {
    try {
      const companyId = req.companyId || req.user?.company;
      if (!companyId) return next(new AppError("Authentication required.", 401));

      const company = await Company.findById(companyId).select("plan billing").lean();
      const currentPlan = company?.billing?.plan || company?.plan || "free";

      if (!hasFeature(currentPlan, feature)) {
        return next(new AppError(`${feature} is not available on the ${currentPlan} plan. Upgrade to access.`, 403));
      }
      return next();
    } catch (err) {
      return next(err);
    }
  };
}

export function enforceLimit(resource, increment = 1) {
  return async (req, _res, next) => {
    try {
      const companyId = req.companyId || req.user?.company;
      if (!companyId) return next(new AppError("Authentication required.", 401));

      // Map resource naming
      const metricMap = {
        slipsPerMonth: "slipsThisMonth",
        customTemplates: "templates",
        customers: "customers",
        users: "teamMembers"
      };

      const metric = metricMap[resource] || resource;
      await usageCounterService.incrementAndCheck(companyId, metric, increment);
      return next();
    } catch (err) {
      if (err.statusCode === 403) {
        return next(new AppError(err.message, 403));
      }
      return next(err);
    }
  };
}

export function attachPlan(_req, _res, next) {
  return next();
}
