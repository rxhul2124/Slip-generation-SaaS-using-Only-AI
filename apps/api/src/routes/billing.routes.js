import { Router } from "express";
import { createOrder, show, updatePlan, verifyPayment, webhook } from "../controllers/billing.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { requireAtLeast } from "../middleware/rbac.js";
import { audit } from "../middleware/audit.js";

export const billingRouter = Router();

// Public webhook - Razorpay calls this without authentication
billingRouter.post("/webhook/razorpay", webhook);

// All other billing routes require authentication
billingRouter.use(requireAuth);
billingRouter.get("/", show);
billingRouter.post("/razorpay/order", requireAtLeast("owner"), createOrder);
billingRouter.post("/razorpay/verify", requireAtLeast("owner"), audit("billing.razorpay_verify", "billing"), verifyPayment);
billingRouter.post("/plan", requireAtLeast("owner"), audit("billing.change_plan", "billing"), updatePlan);
