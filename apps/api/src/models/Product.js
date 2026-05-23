import mongoose from "mongoose";

const dimensionSchema = new mongoose.Schema(
  {
    length: Number,
    width: Number,
    height: Number,
    unit: { type: String, enum: ["mm", "cm", "in"], default: "cm" }
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 180 },
    sku: { type: String, required: true, trim: true, uppercase: true },
    partName: { type: String, trim: true, maxlength: 180 },
    partNumber: { type: String, trim: true, maxlength: 180 },
    barcode: { type: String, trim: true },
    qrReference: String,
    category: String,
    packagingType: String,
    dimensions: dimensionSchema,
    weight: {
      value: Number,
      unit: { type: String, enum: ["G", "KG", "TON", "LB", "g", "kg", "lb", "oz"], default: "KG" }
    },
    units: { type: String, default: "pcs" },
    quantityUnit: { type: String, enum: ["NOS", "PCS", "BOX", "KG", "SET"], default: "NOS" },
    quantityDefault: { type: Number, default: 1 },
    preferredTemplate: { type: mongoose.Schema.Types.ObjectId, ref: "SlipTemplate" },
    assignedCustomers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Customer" }],
    fragile: { type: Boolean, default: false },
    hazardous: { type: Boolean, default: false },
    notes: String,
    internalNotes: String,
    tags: [String],
    image: {
      url: String,
      publicId: String,
      provider: String
    },
    favorite: { type: Boolean, default: false },
    archivedAt: Date,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

productSchema.index({ company: 1, sku: 1 }, { unique: true });
productSchema.index({ company: 1, name: "text", sku: "text", barcode: "text", tags: "text" });

export const Product = mongoose.model("Product", productSchema);
