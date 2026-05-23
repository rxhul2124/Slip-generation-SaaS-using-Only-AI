import { Router } from "express";
import { globalSearch } from "../controllers/search.controller.js";
import { requireAuth } from "../middleware/auth.js";

export const searchRouter = Router();

searchRouter.use(requireAuth);
searchRouter.get("/", globalSearch);
