import { Company } from "../models/Company.js";

export function requirePlan(...allowedPlans) {
  return async (req, res, next) => {
    try {
      const companyId = req.user?.company;
      if (!companyId) {
        return res.status(401).json({ status: "error", message: "Authentication required." });
      }

      // Always query database fresh for strict authorization
      const company = await Company.findById(companyId).select("plan billing").lean();
      if (!company) {
        return res.status(404).json({ status: "error", message: "Workspace not found." });
      }

      const activePlan = company.billing?.plan || company.plan || "free";
      const subscriptionStatus = company.billing?.subscriptionStatus || "active";
      const paymentStatus = company.billing?.paymentStatus || "paid";

      // Verify active subscription state
      if (subscriptionStatus === "paused" || paymentStatus === "overdue") {
        return res.status(403).json({
          status: "error",
          code: "SUBSCRIPTION_PAUSED",
          message: "Your subscription is currently paused or payment is overdue. Please update your payment method."
        });
      }

      // Check plan permission
      if (!allowedPlans.includes(activePlan)) {
        return res.status(403).json({
          status: "error",
          code: "PLAN_REQUIRED",
          allowedPlans,
          currentPlan: activePlan,
          message: `This feature requires one of the following plans: ${allowedPlans.join(", ")}. Please upgrade your subscription.`
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
