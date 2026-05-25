import { startOfMonth } from "date-fns";
import { limitsFor } from "../config/planLimits.js";
import { AppError } from "../utils/AppError.js";
import { Customer } from "../models/Customer.js";
import { Product } from "../models/Product.js";
import { SlipTemplate } from "../models/SlipTemplate.js";
import { GeneratedSlip } from "../models/GeneratedSlip.js";
import { User } from "../models/User.js";

function plan(req) {
  return req.company?.plan || "free";
}

function limitError(message) {
  return new AppError(`${message} Upgrade your plan to continue.`, 402);
}

export function requireFeature(feature) {
  return (req, _res, next) => {
    const limits = limitsFor(plan(req));
    if (!limits.features?.[feature]) return next(limitError(`${feature} is not available on the ${plan(req)} plan.`));
    return next();
  };
}

async function productCount(companyId) {
  const [standalone, customers] = await Promise.all([
    Product.countDocuments({ company: companyId, archivedAt: null }),
    Customer.find({ company: companyId, archivedAt: null }).select("products")
  ]);
  return standalone + customers.reduce((sum, customer) => sum + (customer.products?.length || 0), 0);
}

async function currentUsage(resource, companyId) {
  switch (resource) {
    case "customers":
      return Customer.countDocuments({ company: companyId, archivedAt: null });
    case "products":
      return productCount(companyId);
    case "customTemplates":
      return SlipTemplate.countDocuments({
        company: companyId,
        archivedAt: null,
        name: { $nin: ["Small Template", "Medium Template"] }
      });
    case "slipsPerMonth":
      return GeneratedSlip.countDocuments({ company: companyId, createdAt: { $gte: startOfMonth(new Date()) } });
    case "users":
      return User.countDocuments({ "memberships.company": companyId, "memberships.status": { $in: ["active", "invited"] } });
    default:
      return 0;
  }
}

export function enforceLimit(resource, increment = 1) {
  return async (req, _res, next) => {
    const limits = limitsFor(plan(req));
    const max = limits[resource];
    if (max === Infinity || typeof max !== "number") return next();
    const used = await currentUsage(resource, req.companyId);
    if (used + increment > max) {
      return next(limitError(`${plan(req)} plan limit reached for ${resource}: ${used}/${max}.`));
    }
    return next();
  };
}

export function attachPlan(_req, _res, next) {
  return next();
}
