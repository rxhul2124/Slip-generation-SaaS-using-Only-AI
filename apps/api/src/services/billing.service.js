import { Company } from "../models/Company.js";
import { PLANS_CONFIG, getPlanConfig } from "../config/plans.config.js";
import { subscriptionService } from "./subscription.service.js";
import { webhookService } from "./webhook.service.js";
import { usageCounterService } from "./usageCounter.service.js";
import { billingHistoryService } from "./billingHistory.service.js";

export { PLANS_CONFIG, getPlanConfig };

export async function getBilling(companyId) {
  const company = await Company.findById(companyId).select("plan status billing owner").lean();
  if (!company) {
    const err = new Error("Company not found");
    err.statusCode = 404;
    throw err;
  }

  const currentPlan = company.billing?.plan || company.plan || "free";
  const planConfig = getPlanConfig(currentPlan);

  // Sync counters to guarantee fresh usage numbers
  const usage = company.billing?.usage || (await usageCounterService.syncCounters(companyId));
  const history = await billingHistoryService.getHistoryForCompany(companyId, 10);

  return {
    companyId,
    plan: currentPlan,
    subscriptionStatus: company.billing?.subscriptionStatus || "active",
    paymentStatus: company.billing?.paymentStatus || "paid",
    isTrial: Boolean(company.billing?.isTrial),
    trialEndsAt: company.billing?.trialEndsAt || null,
    currentPeriodStart: company.billing?.currentPeriodStart || null,
    currentPeriodEnd: company.billing?.currentPeriodEnd || null,
    cancelAtPeriodEnd: Boolean(company.billing?.cancelAtPeriodEnd),
    usage,
    planConfig,
    plans: PLANS_CONFIG,
    invoices: history.map((item) => ({
      id: item._id?.toString() || item.invoiceId || `INV-${Date.now()}`,
      paymentId: item.paymentId || "-",
      date: item.createdAt ? new Date(item.createdAt).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
      amount: item.amount ? Math.round(item.amount / 100) : 0,
      currency: item.currency || "INR",
      status: item.status || "paid",
      plan: item.newPlan || currentPlan
    }))
  };
}

export async function createSubscription(companyId, planKey) {
  return await subscriptionService.createSubscription(companyId, planKey);
}

export async function cancelSubscription(companyId) {
  return await subscriptionService.cancelSubscription(companyId);
}

export async function processWebhook(rawBody, signature, secret, payload) {
  if (secret && signature) {
    const isValid = webhookService.verifySignature(rawBody, signature, secret);
    if (!isValid) {
      const err = new Error("Invalid Razorpay webhook signature");
      err.statusCode = 401;
      throw err;
    }
  }
  return await webhookService.processEvent(payload);
}
