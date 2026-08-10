import { usageCounterService } from "../services/usageCounter.service.js";

export function checkUsageLimit(resource, amount = 1) {
  return async (req, res, next) => {
    try {
      const companyId = req.user?.company;
      if (!companyId) {
        return res.status(401).json({ status: "error", message: "Authentication required." });
      }

      await usageCounterService.incrementAndCheck(companyId, resource, amount);
      next();
    } catch (error) {
      if (error.statusCode === 403) {
        return res.status(403).json({
          status: "error",
          code: error.code || "LIMIT_EXCEEDED",
          message: error.message,
          resource: error.resource,
          limit: error.limit,
          currentCount: error.currentCount
        });
      }
      next(error);
    }
  };
}
