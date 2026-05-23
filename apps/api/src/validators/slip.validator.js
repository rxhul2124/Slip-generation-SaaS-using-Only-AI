import { z } from "zod";

export const slipSchema = z.object({
  body: z.object({
    customer: z.string().min(1),
    product: z.string().min(1),
    template: z.string().min(1),
    slipType: z.enum(["packing", "dispatch", "delivery", "warehouse", "qc"]).optional(),
    quantity: z.number().int().positive(),
    quantityUnit: z.enum(["NOS", "PCS", "BOX", "KG", "SET"]).optional(),
    displayWeight: z
      .object({
        value: z.number().nonnegative().optional(),
        unit: z.enum(["KG", "G", "TON", "LB"]).optional()
      })
      .optional(),
    orderReference: z.string().optional(),
    destination: z.string().optional(),
    notes: z.string().optional(),
    signature: z
      .object({
        fullName: z.string().optional(),
        role: z.string().optional(),
        employeeId: z.string().optional(),
        text: z.string().optional(),
        imageDataUrl: z.string().optional(),
        padDataUrl: z.string().optional(),
        mode: z.enum(["text", "image", "pad"]).optional()
      })
      .optional(),
    printSettings: z.record(z.any()).optional()
  })
});

export const bulkSlipSchema = z.object({
  body: z.object({
    rows: z
      .array(
        z.object({
          customer: z.string().min(1),
        product: z.string().min(1),
        template: z.string().min(1),
        slipType: z.enum(["packing", "dispatch", "delivery", "warehouse", "qc"]).optional(),
        quantity: z.number().int().positive(),
        quantityUnit: z.enum(["NOS", "PCS", "BOX", "KG", "SET"]).optional(),
        displayWeight: z
          .object({
            value: z.number().nonnegative().optional(),
            unit: z.enum(["KG", "G", "TON", "LB"]).optional()
          })
          .optional(),
        orderReference: z.string().optional(),
        destination: z.string().optional(),
        notes: z.string().optional(),
        signature: z
          .object({
            fullName: z.string().optional(),
            role: z.string().optional(),
            employeeId: z.string().optional(),
            text: z.string().optional(),
            imageDataUrl: z.string().optional(),
            padDataUrl: z.string().optional(),
            mode: z.enum(["text", "image", "pad"]).optional()
          })
          .optional()
      })
      )
      .min(1)
      .max(1000)
  })
});
