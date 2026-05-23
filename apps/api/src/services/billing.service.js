import { Billing } from "../models/Billing.js";
import { Company } from "../models/Company.js";
import { stripe, razorpay } from "../config/payments.js";
import { AppError } from "../utils/AppError.js";

export const plans = {
  free: { name: "Free", monthlySlipLimit: 100, price: 0, features: ["Basic slips", "Browser print"] },
  pro: { name: "Pro", monthlySlipLimit: Infinity, price: 2900, features: ["Unlimited slips", "Analytics", "Backups", "Thermal printing"] },
  enterprise: { name: "Enterprise", monthlySlipLimit: Infinity, price: null, features: ["Teams", "API access", "Advanced audit", "Dedicated support"] }
};

export async function getBilling(companyId) {
  return Billing.findOne({ company: companyId });
}

export async function changePlan(companyId, plan, provider = "manual") {
  if (!plans[plan]) throw new AppError("Unknown plan", 400);
  if (provider === "manual") throw new AppError("Subscription changes must be confirmed by a payment provider", 403);

  if (provider === "stripe" && !stripe) throw new AppError("Stripe is not configured", 503);
  if (provider === "razorpay" && !razorpay) throw new AppError("Razorpay is not configured", 503);

  const billing = await Billing.findOneAndUpdate(
    { company: companyId },
    { plan, provider, status: "active" },
    { new: true, upsert: true }
  );
  await Company.findByIdAndUpdate(companyId, { plan });
  return billing;
}
