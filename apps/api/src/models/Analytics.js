import mongoose from "mongoose";

const analyticsSchema = new mongoose.Schema(
  {
    company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    date: { type: Date, required: true },
    slipsGenerated: { type: Number, default: 0 },
    prints: { type: Number, default: 0 },
    exports: { type: Number, default: 0 },
    productUsage: [{ product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" }, count: Number }],
    customerUsage: [{ customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" }, count: Number }],
    templateUsage: [{ template: { type: mongoose.Schema.Types.ObjectId, ref: "SlipTemplate" }, count: Number }],
    peakHour: Number
  },
  { timestamps: true }
);

analyticsSchema.index({ company: 1, date: 1 }, { unique: true });

export const Analytics = mongoose.model("Analytics", analyticsSchema);
