import { Router } from "express";
import multer from "multer";
import { getSettings, updateSettings, uploadLogo } from "../controllers/settings.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { requireAtLeast } from "../middleware/rbac.js";
import { audit } from "../middleware/audit.js";
import { validate } from "../middleware/validate.js";
import { settingsSchema } from "../validators/settings.validator.js";

const upload = multer({ dest: "uploads/", limits: { fileSize: 5 * 1024 * 1024 } });
export const settingsRouter = Router();

settingsRouter.use(requireAuth);
settingsRouter.get("/", getSettings);
settingsRouter.patch("/", requireAtLeast("admin"), audit("settings.update", "settings"), validate(settingsSchema), updateSettings);
settingsRouter.post("/logo", requireAtLeast("admin"), upload.single("logo"), audit("settings.logo_upload", "company"), uploadLogo);
