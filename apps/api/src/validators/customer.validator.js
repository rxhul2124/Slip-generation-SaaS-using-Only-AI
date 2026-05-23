import { z } from "zod";

const address = z
  .object({
    line1: z.string().optional(),
    line2: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    postalCode: z.string().optional()
  })
  .optional();

const product = z.object({
  _id: z.string().optional(),
  name: z.string().min(1).max(180),
  sku: z.string().optional(),
  partName: z.string().optional(),
  partNumber: z.string().optional(),
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
      unit: z.enum(["KG", "G", "TON", "LB"]).optional()
    })
    .optional(),
  quantityUnit: z.enum(["NOS", "PCS", "BOX", "KG", "SET"]).optional(),
  quantityDefault: z.number().int().positive().optional(),
  notes: z.string().optional(),
  barcode: z.string().optional(),
  qrReference: z.string().optional(),
  preferredTemplate: z.string().optional(),
  favorite: z.boolean().optional()
});

export const customerSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(180),
    contactPerson: z.string().optional(),
    email: z.string().email().optional().or(z.literal("")),
    phone: z.string().optional(),
    taxNumber: z.string().optional(),
    shippingAddress: address,
    billingAddress: address,
    shippingInstructions: z.string().optional(),
    preferredTemplates: z.array(z.string()).optional(),
    products: z.array(product).optional(),
    notes: z.string().optional(),
    tags: z.array(z.string()).optional(),
    favorite: z.boolean().optional()
  })
});

export const customerUpdateSchema = z.object({
  body: customerSchema.shape.body.partial()
});
