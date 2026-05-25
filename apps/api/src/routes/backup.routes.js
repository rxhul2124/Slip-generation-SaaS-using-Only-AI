import { Router } from "express";
import { exportWorkspace, listBackups } from "../controllers/backup.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { requireAtLeast } from "../middleware/rbac.js";
import { audit } from "../middleware/audit.js";
import { requireFeature } from "../middleware/plan.js";

export const backupRouter = Router();

backupRouter.use(requireAuth, requireAtLeast("admin"), requireFeature("backups"));
backupRouter.get("/", listBackups);
backupRouter.post("/export", audit("backup.export", "backup"), exportWorkspace);
