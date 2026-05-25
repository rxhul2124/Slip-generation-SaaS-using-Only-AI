import { Router } from "express";
import { presets } from "../controllers/preset.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { requireAtLeast } from "../middleware/rbac.js";
import { audit } from "../middleware/audit.js";
import { requireFeature } from "../middleware/plan.js";
import { validate } from "../middleware/validate.js";
import { presetSchema, presetUpdateSchema } from "../validators/preset.validator.js";

export const presetRouter = Router();

presetRouter.use(requireAuth);
presetRouter.get("/", requireFeature("presets"), presets.list);
presetRouter.post("/", requireAtLeast("manager"), requireFeature("presets"), audit("preset.create", "preset"), validate(presetSchema), presets.create);
presetRouter.get("/:id", presets.get);
presetRouter.patch("/:id", requireAtLeast("manager"), audit("preset.update", "preset"), validate(presetUpdateSchema), presets.update);
presetRouter.delete("/:id", requireAtLeast("admin"), audit("preset.delete", "preset"), presets.remove);
