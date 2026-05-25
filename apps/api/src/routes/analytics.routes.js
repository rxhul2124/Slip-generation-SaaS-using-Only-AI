import { Router } from "express";
import { dashboard, trends } from "../controllers/analytics.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { requireFeature } from "../middleware/plan.js";

export const analyticsRouter = Router();

analyticsRouter.use(requireAuth, requireFeature("analytics"));
analyticsRouter.get("/dashboard", dashboard);
analyticsRouter.get("/trends", trends);
