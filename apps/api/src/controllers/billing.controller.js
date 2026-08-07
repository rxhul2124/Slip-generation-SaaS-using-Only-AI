import { asyncHandler } from "../utils/asyncHandler.js";
import { cancelSubscription, createSubscription, getBilling, processWebhook } from "../services/billing.service.js";

export const show = asyncHandler(async (req, res) => {
  const companyId = req.companyId || req.user?.company;
  const data = await getBilling(companyId);
  res.json({ status: "success", data });
});

export const createSubscriptionOrder = asyncHandler(async (req, res) => {
  const companyId = req.companyId || req.user?.company;
  const planKey = req.body.plan;
  const result = await createSubscription(companyId, planKey);
  res.json({ status: "success", data: result });
});

export const cancelSub = asyncHandler(async (req, res) => {
  const companyId = req.companyId || req.user?.company;
  const result = await cancelSubscription(companyId);
  res.json({ status: "success", data: result });
});

export const webhook = asyncHandler(async (req, res) => {
  const signature = req.headers["x-razorpay-signature"];
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const rawBody = req.rawBody || JSON.stringify(req.body);

  const result = await processWebhook(rawBody, signature, secret, req.body);
  res.json({ status: "success", data: result });
});
