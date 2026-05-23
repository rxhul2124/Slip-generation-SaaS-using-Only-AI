import { z } from "zod";

export const inviteSchema = z.object({
  body: z.object({
    email: z.string().email(),
    role: z.enum(["admin", "manager", "staff"])
  })
});

export const updateMemberSchema = z.object({
  body: z.object({
    role: z.enum(["admin", "manager", "staff"]).optional(),
    status: z.enum(["active", "disabled"]).optional()
  })
});
