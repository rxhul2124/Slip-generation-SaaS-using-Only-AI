import { Router } from "express";
import { invite, listMembers, updateMember } from "../controllers/team.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";
import { audit } from "../middleware/audit.js";
import { enforceLimit } from "../middleware/plan.js";
import { validate } from "../middleware/validate.js";
import { inviteSchema, updateMemberSchema } from "../validators/team.validator.js";

export const teamRouter = Router();

teamRouter.use(requireAuth, requireRole("owner"));
teamRouter.get("/", listMembers);
teamRouter.post("/invites", enforceLimit("users"), audit("team.invite", "teamInvite"), validate(inviteSchema), invite);
teamRouter.patch("/:userId", audit("team.update_member", "user"), validate(updateMemberSchema), updateMember);
