import { z } from "zod";

export const settingsSchema = z.object({
  body: z.object({
    branding: z.record(z.any()).optional(),
    printerDefaults: z.record(z.any()).optional(),
    templateDefaults: z.record(z.any()).optional(),
    locale: z.record(z.any()).optional(),
    backup: z.record(z.any()).optional()
  })
});
