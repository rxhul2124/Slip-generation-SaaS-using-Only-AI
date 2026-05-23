import { AuditLog } from "../models/AuditLog.js";
import { pagination, sortOption } from "../utils/apiFeatures.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const auditLogs = asyncHandler(async (req, res) => {
  const { page, limit, skip } = pagination(req.query);
  const query = { company: req.companyId };
  if (req.query.action) query.action = req.query.action;
  if (req.query.resource) query.resource = req.query.resource;

  const [items, total] = await Promise.all([
    AuditLog.find(query).populate("user", "name email").sort(sortOption(req.query.sort)).skip(skip).limit(limit),
    AuditLog.countDocuments(query)
  ]);

  res.json({ status: "success", data: items, meta: { page, limit, total, pages: Math.ceil(total / limit) } });
});
