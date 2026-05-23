import { z } from "zod";

const element = z.object({
  id: z.string(),
  type: z.enum(["text", "field", "barcode", "qr", "logo", "line", "box", "icon"]),
  label: z.string().optional(),
  field: z.string().optional(),
  x: z.number(),
  y: z.number(),
  width: z.number().positive(),
  height: z.number().positive(),
  rotate: z.number().optional(),
  zIndex: z.number().optional(),
  locked: z.boolean().optional(),
  style: z.record(z.any()).optional(),
  value: z.any().optional()
});

export const templateSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    format: z.enum(["2x4", "4x6", "a4", "letter", "custom"]).optional(),
    renderer: z.enum(["template", "industrial"]).optional(),
    units: z.enum(["mm", "cm", "in", "px"]).optional(),
    width: z.number().positive(),
    height: z.number().positive(),
    orientation: z.enum(["portrait", "landscape"]).optional(),
    pageSize: z.enum(["label", "a4", "letter", "custom"]).optional(),
    thermalMode: z.boolean().optional(),
    margins: z
      .object({
        top: z.number().nonnegative(),
        right: z.number().nonnegative(),
        bottom: z.number().nonnegative(),
        left: z.number().nonnegative()
      })
      .optional(),
    padding: z.number().nonnegative().optional(),
    spacing: z.number().nonnegative().optional(),
    fontSize: z.number().positive().optional(),
    borderThickness: z.number().nonnegative().optional(),
    bleed: z.number().nonnegative().optional(),
    cropMarks: z.boolean().optional(),
    snapGrid: z.number().positive().optional(),
    elements: z.array(element).optional(),
    favorite: z.boolean().optional()
  })
});

export const templateUpdateSchema = z.object({
  body: templateSchema.shape.body.partial()
});
