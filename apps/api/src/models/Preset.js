import mongoose from "mongoose";

const presetSchema = new mongoose.Schema(
  {
    company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: String,
    template: { type: mongoose.Schema.Types.ObjectId, ref: "SlipTemplate", required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    dimensions: mongoose.Schema.Types.Mixed,
    printSettings: mongoose.Schema.Types.Mixed,
    tags: [String],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

presetSchema.index({ company: 1, name: 1 }, { unique: true });

export const Preset = mongoose.model("Preset", presetSchema);
