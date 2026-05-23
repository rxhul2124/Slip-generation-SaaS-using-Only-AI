import { Router } from "express";
import * as controller from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { authLimiter } from "../middleware/rateLimiter.js";
import { csrfToken } from "../middleware/csrf.js";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verifyEmailSchema
} from "../validators/auth.validator.js";

export const authRouter = Router();

authRouter.post("/register", authLimiter, validate(registerSchema), controller.register);
authRouter.post("/login", authLimiter, validate(loginSchema), controller.login);
authRouter.post("/refresh", controller.refresh);
authRouter.post("/logout", controller.logout);
authRouter.post("/forgot-password", authLimiter, validate(forgotPasswordSchema), controller.forgotPassword);
authRouter.post("/reset-password", authLimiter, validate(resetPasswordSchema), controller.resetPassword);
authRouter.post("/verify-email", validate(verifyEmailSchema), controller.verifyEmail);
authRouter.get("/me", requireAuth, controller.me);
authRouter.get("/csrf-token", csrfToken);
