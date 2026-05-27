import { Backup } from "../models/Backup.js";
import { createWorkspaceExport } from "../services/backup.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { pagination, sortOption } from "../utils/apiFeatures.js";

export const listBackups = asyncHandler(async (req, res) => {
  const { page, limit, skip } = pagination(req.query);
  const query = { company: req.companyId };
  
  const [items, total] = await Promise.all([
    Backup.find(query).sort(sortOption(req.query.sort)).skip(skip).limit(limit).select("-metadata"),
    Backup.countDocuments(query)
  ]);

  res.json({ status: "success", data: items, meta: { page, limit, total, pages: Math.ceil(total / limit) } });
});

export const exportWorkspace = asyncHandler(async (req, res) => {
  const backup = await createWorkspaceExport(req.companyId, req.user._id);
  await req.audit?.({ checksum: backup.checksum }, backup._id.toString());
  res.status(201).json({ status: "success", data: backup });
});
