import { Router } from "express";
import { templates } from "../controllers/template.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { requireAtLeast } from "../middleware/rbac.js";
import { validate } from "../middleware/validate.js";
import { audit } from "../middleware/audit.js";
import { templateSchema, templateUpdateSchema } from "../validators/template.validator.js";

export const templateRouter = Router();

templateRouter.use(requireAuth);
templateRouter.get("/", templates.list);
templateRouter.post("/", requireAtLeast("manager"), audit("template.create", "template"), validate(templateSchema), templates.create);
templateRouter.get("/:id", templates.get);
templateRouter.patch("/:id", requireAtLeast("manager"), audit("template.update", "template"), validate(templateUpdateSchema), templates.update);
templateRouter.patch("/:id/archive", requireAtLeast("manager"), audit("template.archive", "template"), templates.archive);
templateRouter.delete("/:id", requireAtLeast("admin"), audit("template.delete", "template"), templates.remove);
