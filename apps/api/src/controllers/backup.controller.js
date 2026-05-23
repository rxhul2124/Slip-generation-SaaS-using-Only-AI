import { Backup } from "../models/Backup.js";
import { createWorkspaceExport } from "../services/backup.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listBackups = asyncHandler(async (req, res) => {
  const backups = await Backup.find({ company: req.companyId }).sort("-createdAt").select("-metadata");
  res.json({ status: "success", data: backups });
});

export const exportWorkspace = asyncHandler(async (req, res) => {
  const backup = await createWorkspaceExport(req.companyId, req.user._id);
  await req.audit?.({ checksum: backup.checksum }, backup._id.toString());
  res.status(201).json({ status: "success", data: backup });
});
