import { Router } from "express";
import multer from "multer";
import { getSettings, updateSettings, uploadLogo } from "../controllers/settings.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { requireAtLeast } from "../middleware/rbac.js";
import { audit } from "../middleware/audit.js";
import { validate } from "../middleware/validate.js";
import { uploadLimiter } from "../middleware/rateLimiter.js";
import { settingsSchema } from "../validators/settings.validator.js";

const allowedImageTypes = new Set(["image/png", "image/jpeg", "image/webp", "image/gif", "image/svg+xml"]);
const allowedImageExtensions = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"]);

function extensionFor(filename = "") {
  const index = filename.lastIndexOf(".");
  return index >= 0 ? filename.slice(index).toLowerCase() : "";
}

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    const validType = allowedImageTypes.has(file.mimetype);
    const validExtension = allowedImageExtensions.has(extensionFor(file.originalname));
    callback(validType && validExtension ? null : new Error("Invalid image upload"), validType && validExtension);
  }
});
export const settingsRouter = Router();

settingsRouter.use(requireAuth);
settingsRouter.get("/", getSettings);
settingsRouter.patch("/", requireAtLeast("admin"), audit("settings.update", "settings"), validate(settingsSchema), updateSettings);
settingsRouter.post("/logo", uploadLimiter, requireAtLeast("admin"), upload.single("logo"), audit("settings.logo_upload", "company"), uploadLogo);
