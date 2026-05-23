import { Router } from "express";
import { show, updatePlan } from "../controllers/billing.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { requireAtLeast } from "../middleware/rbac.js";
import { audit } from "../middleware/audit.js";

export const billingRouter = Router();

billingRouter.use(requireAuth);
billingRouter.get("/", show);
billingRouter.post("/plan", requireAtLeast("owner"), audit("billing.change_plan", "billing"), updatePlan);
