import { Router } from "express";
import { customers } from "../controllers/customer.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { requireAtLeast } from "../middleware/rbac.js";
import { validate } from "../middleware/validate.js";
import { audit } from "../middleware/audit.js";
import { enforceLimit } from "../middleware/plan.js";
import { customerSchema, customerUpdateSchema } from "../validators/customer.validator.js";

export const customerRouter = Router();

customerRouter.use(requireAuth);
customerRouter.get("/", customers.list);
customerRouter.post("/", requireAtLeast("manager"), enforceLimit("customers"), audit("customer.create", "customer"), validate(customerSchema), customers.create);
customerRouter.get("/:id", customers.get);
customerRouter.patch("/:id", requireAtLeast("manager"), audit("customer.update", "customer"), validate(customerUpdateSchema), customers.update);
customerRouter.patch("/:id/archive", requireAtLeast("manager"), audit("customer.archive", "customer"), customers.archive);
customerRouter.delete("/:id", requireAtLeast("admin"), audit("customer.delete", "customer"), customers.remove);
