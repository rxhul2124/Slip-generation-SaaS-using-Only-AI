import { Router } from "express";
import { auditLogs } from "../controllers/audit.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { requireAtLeast } from "../middleware/rbac.js";

export const auditRouter = Router();

auditRouter.use(requireAuth, requireAtLeast("admin"));
auditRouter.get("/", auditLogs);
