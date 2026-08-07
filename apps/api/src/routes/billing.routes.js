import { Router } from "express";
import { cancelSub, createSubscriptionOrder, show, webhook } from "../controllers/billing.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { requireAtLeast } from "../middleware/rbac.js";

export const billingRouter = Router();

// Webhook endpoint (signature verified inside webhook controller/service)
billingRouter.post("/webhook", webhook);
billingRouter.post("/webhook/razorpay", webhook);

// Authenticated billing routes
billingRouter.use(requireAuth);
billingRouter.get("/", show);
billingRouter.post("/create-subscription", requireAtLeast("owner"), createSubscriptionOrder);
billingRouter.post("/cancel-subscription", requireAtLeast("owner"), cancelSub);
billingRouter.post("/razorpay/order", requireAtLeast("owner"), createSubscriptionOrder);
