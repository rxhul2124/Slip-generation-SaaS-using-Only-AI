import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    line1: String,
    line2: String,
    city: String,
    state: String,
    country: String,
    postalCode: String
  },
  { _id: false }
);

const dimensionSchema = new mongoose.Schema(
  {
    length: Number,
    width: Number,
    height: Number,
    unit: { type: String, enum: ["mm", "cm", "in"], default: "mm" }
  },
  { _id: false }
);

const customerProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 180 },
    sku: { type: String, trim: true, uppercase: true },
    partName: { type: String, trim: true, maxlength: 180 },
    partNumber: { type: String, trim: true, maxlength: 180 },
    dimensions: dimensionSchema,
    weight: {
      value: Number,
      unit: { type: String, enum: ["KG", "G", "TON", "LB"], default: "KG" }
    },
    quantityUnit: { type: String, enum: ["NOS", "PCS", "BOX", "KG", "SET"], default: "NOS" },
    quantityDefault: { type: Number, default: 1 },
    notes: String,
    barcode: { type: String, trim: true },
    qrReference: String,
    preferredTemplate: { type: mongoose.Schema.Types.ObjectId, ref: "SlipTemplate" },
    favorite: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const customerSchema = new mongoose.Schema(
  {
    company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 180 },
    contactPerson: String,
    email: { type: String, lowercase: true, trim: true },
    phone: String,
    taxNumber: String,
    shippingAddress: addressSchema,
    billingAddress: addressSchema,
    shippingInstructions: String,
    preferredTemplates: [{ type: mongoose.Schema.Types.ObjectId, ref: "SlipTemplate" }],
    products: [customerProductSchema],
    notes: String,
    tags: [String],
    favorite: { type: Boolean, default: false },
    archivedAt: Date,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

customerSchema.index({ company: 1, name: 1 });
customerSchema.index({ company: 1, name: "text", contactPerson: "text", email: "text", phone: "text", taxNumber: "text" });

export const Customer = mongoose.model("Customer", customerSchema);
