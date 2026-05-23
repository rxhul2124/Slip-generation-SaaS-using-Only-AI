import { z } from "zod";

export const productSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(180),
    sku: z.string().min(1).max(80),
    partName: z.string().max(180).optional(),
    partNumber: z.string().max(180).optional(),
    barcode: z.string().optional(),
    qrReference: z.string().optional(),
    category: z.string().optional(),
    packagingType: z.string().optional(),
    dimensions: z
      .object({
        length: z.number().nonnegative().optional(),
        width: z.number().nonnegative().optional(),
        height: z.number().nonnegative().optional(),
        unit: z.enum(["mm", "cm", "in"]).optional()
      })
      .optional(),
    weight: z
      .object({
        value: z.number().nonnegative().optional(),
        unit: z.enum(["KG", "G", "TON", "LB", "g", "kg", "lb", "oz"]).optional()
      })
      .optional(),
    units: z.string().optional(),
    quantityUnit: z.enum(["NOS", "PCS", "BOX", "KG", "SET"]).optional(),
    quantityDefault: z.number().int().positive().optional(),
    preferredTemplate: z.string().optional(),
    assignedCustomers: z.array(z.string()).optional(),
    fragile: z.boolean().optional(),
    hazardous: z.boolean().optional(),
    notes: z.string().optional(),
    internalNotes: z.string().optional(),
    tags: z.array(z.string()).optional(),
    favorite: z.boolean().optional()
  })
});

export const productUpdateSchema = z.object({
  body: productSchema.shape.body.partial()
});
