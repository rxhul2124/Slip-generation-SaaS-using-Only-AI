import { Router } from "express";
import multer from "multer";
import { products, importProducts } from "../controllers/product.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { requireAtLeast } from "../middleware/rbac.js";
import { validate } from "../middleware/validate.js";
import { audit } from "../middleware/audit.js";
import { enforceLimit, requireFeature } from "../middleware/plan.js";
import { productSchema, productUpdateSchema } from "../validators/product.validator.js";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 6 * 1024 * 1024 } });
export const productRouter = Router();

productRouter.use(requireAuth);
productRouter.get("/", products.list);
productRouter.post("/", requireAtLeast("manager"), enforceLimit("products"), audit("product.create", "product"), validate(productSchema), products.create);
productRouter.post("/import", requireAtLeast("manager"), requireFeature("bulk"), upload.single("file"), audit("product.import", "product"), importProducts);
productRouter.get("/:id", products.get);
productRouter.patch("/:id", requireAtLeast("manager"), audit("product.update", "product"), validate(productUpdateSchema), products.update);
productRouter.patch("/:id/archive", requireAtLeast("manager"), audit("product.archive", "product"), products.archive);
productRouter.delete("/:id", requireAtLeast("admin"), audit("product.delete", "product"), products.remove);
