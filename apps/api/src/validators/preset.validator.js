import { z } from "zod";

export const presetSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    template: z.string().min(1),
    customer: z.string().optional(),
    product: z.string().optional(),
    dimensions: z.record(z.any()).optional(),
    printSettings: z.record(z.any()).optional(),
    tags: z.array(z.string()).optional()
  })
});

export const presetUpdateSchema = z.object({
  body: presetSchema.shape.body.partial()
});
