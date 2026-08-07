import { Company } from "../models/Company.js";
import { Customer } from "../models/Customer.js";
import { Template } from "../models/Template.js";
import { User } from "../models/User.js";
import { getPlanConfig, isWithinLimit } from "../config/plans.config.js";

function getCurrentYearMonth() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export const usageCounterService = {
  getCurrentYearMonth,

  /**
   * Check limit and increment usage counter atomically.
   * Throws 403 error if user is over limit.
   */
  async incrementAndCheck(companyId, resource, amount = 1) {
    const currentPeriod = getCurrentYearMonth();
    const company = await Company.findById(companyId).select("plan billing").lean();

    if (!company) {
      const err = new Error("Company not found");
      err.statusCode = 404;
      throw err;
    }

    const currentPlan = company.billing?.plan || company.plan || "free";
    const usage = company.billing?.usage || {};

    // Lazy Monthly Reset for slips
    let slipsThisMonth = usage.slipsThisMonth || 0;
    if (usage.lastResetPeriod !== currentPeriod) {
      slipsThisMonth = 0;
      await Company.findByIdAndUpdate(companyId, {
        $set: {
          "billing.usage.slipsThisMonth": 0,
          "billing.usage.lastResetPeriod": currentPeriod
        }
      });
    }

    // Map resource to metric field name
    const currentCount = resource === "slipsThisMonth" ? slipsThisMonth : (usage[resource] || 0);

    if (!isWithinLimit(currentPlan, resource, currentCount + amount - 1)) {
      const config = getPlanConfig(currentPlan);
      const limit = config.limits[resource];
      const err = new Error(`Usage limit reached. Your ${currentPlan} plan permits up to ${limit} ${resource}. Please upgrade.`);
      err.statusCode = 403;
      err.code = "LIMIT_EXCEEDED";
      err.resource = resource;
      err.limit = limit;
      err.currentCount = currentCount;
      throw err;
    }

    // Atomic increment
    const updated = await Company.findByIdAndUpdate(
      companyId,
      {
        $inc: { [`billing.usage.${resource}`]: amount },
        $set: { "billing.usage.lastResetPeriod": currentPeriod }
      },
      { new: true }
    );

    return updated?.billing?.usage;
  },

  /**
   * Decrement usage counter safely when resource is deleted.
   */
  async decrement(companyId, resource, amount = 1) {
    const company = await Company.findById(companyId).select("billing.usage").lean();
    if (!company) return;

    const current = company.billing?.usage?.[resource] || 0;
    const dec = Math.min(current, amount);
    if (dec <= 0) return;

    await Company.findByIdAndUpdate(companyId, {
      $inc: { [`billing.usage.${resource}`]: -dec }
    });
  },

  /**
   * Recalculates exact counts from DB collections for self-healing counter recovery.
   */
  async syncCounters(companyId) {
    const [templatesCount, customersCount, teamCount] = await Promise.all([
      Template.countDocuments({ company: companyId }),
      Customer.countDocuments({ company: companyId }),
      User.countDocuments({ company: companyId })
    ]);

    const updated = await Company.findByIdAndUpdate(
      companyId,
      {
        $set: {
          "billing.usage.templates": templatesCount,
          "billing.usage.customers": customersCount,
          "billing.usage.teamMembers": Math.max(1, teamCount)
        }
      },
      { new: true }
    );

    return updated?.billing?.usage;
  }
};
