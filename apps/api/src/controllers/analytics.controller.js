import { Analytics } from "../models/Analytics.js";
import { dashboardMetrics } from "../services/analytics.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const dashboard = asyncHandler(async (req, res) => {
  const data = await dashboardMetrics(req.companyId);
  res.json({ status: "success", data });
});

export const trends = asyncHandler(async (req, res) => {
  const days = Math.min(Number(req.query.days) || 30, 365);
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const data = await Analytics.find({ company: req.companyId, date: { $gte: since } }).sort("date");
  res.json({ status: "success", data });
});
