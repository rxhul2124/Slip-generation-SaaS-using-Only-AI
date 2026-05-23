import mongoose from "mongoose";

const printJobSchema = new mongoose.Schema(
  {
    company: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    slips: [{ type: mongoose.Schema.Types.ObjectId, ref: "GeneratedSlip" }],
    status: { type: String, enum: ["queued", "rendering", "ready", "printing", "completed", "failed"], default: "queued" },
    printer: String,
    format: { type: String, enum: ["browser", "pdf", "thermal"], default: "browser" },
    copies: { type: Number, default: 1 },
    error: String,
    queuedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    completedAt: Date
  },
  { timestamps: true }
);

printJobSchema.index({ company: 1, createdAt: -1 });

export const PrintJob = mongoose.model("PrintJob", printJobSchema);
