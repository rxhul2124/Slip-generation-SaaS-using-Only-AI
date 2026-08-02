import { asyncHandler } from "../utils/asyncHandler.js";
import { changePlan, createRazorpayOrder, getBilling, handleRazorpayWebhook, plans, verifyRazorpayPayment } from "../services/billing.service.js";

export const show = asyncHandler(async (req, res) => {
  const billing = await getBilling(req.companyId);
  res.json({ status: "success", data: { billing, plans } });
});

export const createOrder = asyncHandler(async (req, res) => {
  const result = await createRazorpayOrder(req.companyId, req.body.plan);
  res.json({ status: "success", data: result });
});

export const verifyPayment = asyncHandler(async (req, res) => {
  const billing = await verifyRazorpayPayment(req.companyId, req.body);
  await req.audit?.({ plan: req.body.plan, provider: "razorpay" }, billing._id.toString());
  res.json({ status: "success", data: billing });
});

export const webhook = asyncHandler(async (req, res) => {
  await handleRazorpayWebhook(req.body);
  res.json({ status: "success", data: { received: true } });
});

export const updatePlan = asyncHandler(async (req, res) => {
  const billing = await changePlan(req.companyId, req.body.plan, req.body.provider);
  await req.audit?.({ plan: req.body.plan, provider: req.body.provider }, billing._id.toString());
  res.json({ status: "success", data: billing });
});
