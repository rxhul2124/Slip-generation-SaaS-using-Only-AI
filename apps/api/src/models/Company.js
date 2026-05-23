import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 160 },
    slug: { type: String, required: true, lowercase: true, trim: true, unique: true },
    logo: {
      url: String,
      publicId: String,
      provider: String
    },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    industry: String,
    taxId: String,
    address: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      country: String,
      postalCode: String
    },
    onboarding: {
      workspaceCreated: { type: Boolean, default: true },
      logoUploaded: { type: Boolean, default: false },
      productsAdded: { type: Boolean, default: false },
      customersAdded: { type: Boolean, default: false },
      defaultSlipSizeSelected: { type: Boolean, default: false },
      printerConfigured: { type: Boolean, default: false },
      completedAt: Date
    },
    plan: { type: String, enum: ["free", "pro", "enterprise"], default: "free" },
    status: { type: String, enum: ["active", "past_due", "suspended"], default: "active" }
  },
  { timestamps: true }
);

export const Company = mongoose.model("Company", companySchema);
