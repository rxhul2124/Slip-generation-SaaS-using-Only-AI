import { Router } from "express";
import * as controller from "../controllers/slip.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { audit } from "../middleware/audit.js";
import { enforceLimit, requireFeature } from "../middleware/plan.js";
import { uploadLimiter } from "../middleware/rateLimiter.js";
import { validate } from "../middleware/validate.js";
import { slipSchema, bulkSlipSchema } from "../validators/slip.validator.js";

export const slipRouter = Router();

slipRouter.use(requireAuth);
slipRouter.get("/", controller.list);
slipRouter.post("/", enforceLimit("slipsPerMonth"), audit("slip.generate", "slip"), validate(slipSchema), controller.create);
slipRouter.post("/bulk", requireFeature("bulk"), audit("slip.bulk_generate", "slip"), validate(bulkSlipSchema), controller.bulk);
slipRouter.post("/bulk-csv", uploadLimiter, requireFeature("bulk"), controller.upload.single("file"), audit("slip.bulk_csv", "slip"), controller.bulkCsv);
slipRouter.get("/print-jobs", controller.printJobs);
slipRouter.post("/print-jobs", audit("print.queue", "printJob"), controller.queuePrint);
slipRouter.get("/:id", controller.get);
slipRouter.post("/:id/duplicate", audit("slip.duplicate", "slip"), controller.duplicate);
slipRouter.post("/:id/print", audit("slip.print", "slip"), controller.print);
slipRouter.post("/:id/export", audit("slip.export", "slip"), controller.exportSlip);
