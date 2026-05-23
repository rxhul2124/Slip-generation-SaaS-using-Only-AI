import { asyncHandler } from "../utils/asyncHandler.js";
import { changePlan, getBilling, plans } from "../services/billing.service.js";

export const show = asyncHandler(async (req, res) => {
  const billing = await getBilling(req.companyId);
  res.json({ status: "success", data: { billing, plans } });
});

export const updatePlan = asyncHandler(async (req, res) => {
  const billing = await changePlan(req.companyId, req.body.plan, req.body.provider);
  await req.audit?.({ plan: req.body.plan, provider: req.body.provider }, billing._id.toString());
  res.json({ status: "success", data: billing });
});
